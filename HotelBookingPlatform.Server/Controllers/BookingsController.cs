using AutoMapper;
using HotelBookingPlatform.Core.DTOs;
using HotelBookingPlatform.Core.Entities;
using HotelBookingPlatform.Core.Enums;
using HotelBookingPlatform.Core.Helpers;
using HotelBookingPlatform.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace HotelBookingPlatform.Server.Controllers;

[Route("api/[controller]")]
[ApiController]
public class BookingsController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly IMapper _mapper;

    public BookingsController(ApplicationDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    private int GetCurrentUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
        if (userIdClaim == null)
        {
            throw new UnauthorizedAccessException("User not authenticated");
        }
        return int.Parse(userIdClaim.Value);
    }

    // GET: api/Bookings/my  (returns current authenticated user's bookings)
    [HttpGet("my")]
    [Authorize]
    public async Task<ActionResult<IEnumerable<BookingResponseDto>>> GetMyBookings()
    {
        try
        {
            var userId = GetCurrentUserId();
            var bookings = await _context.Bookings
                .Include(b => b.Room)
                    .ThenInclude(r => r.Hotel)
                .Where(b => b.UserId == userId)
                .OrderByDescending(b => b.CreatedAt)
                .ToListAsync();
            return Ok(_mapper.Map<IEnumerable<BookingResponseDto>>(bookings));
        }
        catch (UnauthorizedAccessException)
        {
            return Unauthorized();
        }
    }

    // GET: api/Bookings/all  (Admin only — returns all users' bookings)
    [HttpGet("all")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<IEnumerable<AdminBookingResponseDto>>> GetAllBookings()
    {
        var bookings = await _context.Bookings
            .Include(b => b.User)
            .Include(b => b.Room)
                .ThenInclude(r => r.Hotel)
            .OrderByDescending(b => b.CreatedAt)
            .ToListAsync();

        return Ok(_mapper.Map<IEnumerable<AdminBookingResponseDto>>(bookings));
    }

    // GET: api/Bookings/user/5  (own data for users, any userId for admins)
    [HttpGet("user/{userId}")]
    [Authorize]
    public async Task<ActionResult<IEnumerable<BookingResponseDto>>> GetUserBookings(int userId)
    {
        // Regular users can only view their own bookings
        var isAdmin = User.IsInRole("Admin");
        if (!isAdmin)
        {
            try
            {
                var requestingUserId = GetCurrentUserId();
                if (requestingUserId != userId)
                    return Forbid(); // 403 — can't peek at other users' data
            }
            catch (UnauthorizedAccessException)
            {
                return Unauthorized();
            }
        }

        var bookings = await _context.Bookings
            .Include(b => b.Room)
                .ThenInclude(r => r.Hotel)
            .Where(b => b.UserId == userId)
            .OrderByDescending(b => b.CreatedAt)
            .ToListAsync();

        return Ok(_mapper.Map<IEnumerable<BookingResponseDto>>(bookings));
    }

    // GET: api/Bookings/5
    [HttpGet("{id}")]
    public async Task<ActionResult<BookingResponseDto>> GetBooking(int id)
    {
        var booking = await _context.Bookings
            .Include(b => b.Room)
                .ThenInclude(r => r.Hotel)
            .FirstOrDefaultAsync(b => b.Id == id);

        if (booking == null)
        {
            return NotFound();
        }

        return Ok(_mapper.Map<BookingResponseDto>(booking));
    }

    // POST: api/Bookings
    [HttpPost]
    //[Authorize]
    public async Task<ActionResult<object>> CreateBooking(CreateBookingDto bookingDto)
    {
        try
        {
            var userId = GetCurrentUserId();

            // Check if room exists
            var room = await _context.Rooms
                .Include(r => r.Hotel)
                .FirstOrDefaultAsync(r => r.Id == bookingDto.RoomId);

            if (room == null)
            {
                return BadRequest("Room not found");
            }

            // Validate dates
            if (bookingDto.CheckInDate >= bookingDto.CheckOutDate)
            {
                return BadRequest("Check-in date must be before check-out date");
            }

            if (bookingDto.CheckInDate < DateTime.Today)
            {
                return BadRequest("Check-in date cannot be in the past");
            }

            // Check if room is available
            var isAvailable = await IsRoomAvailable(
                bookingDto.RoomId,
                bookingDto.CheckInDate,
                bookingDto.CheckOutDate);

            if (!isAvailable)
            {
                return BadRequest("Room is not available for the selected dates");
            }

            // Check room capacity
            if (bookingDto.NumberOfGuests > room.Capacity)
            {
                return BadRequest($"Room can only accommodate {room.Capacity} guests");
            }

            // Calculate total price
            var numberOfNights = (bookingDto.CheckOutDate - bookingDto.CheckInDate).Days;
            var totalPrice = room.PricePerNight * numberOfNights;

            // Create booking
            var booking = new Booking
            {
                BookingReference = BookingReferenceGenerator.GenerateReference(),
                RoomId = bookingDto.RoomId,
                UserId = userId,
                CheckInDate = bookingDto.CheckInDate,
                CheckOutDate = bookingDto.CheckOutDate,
                NumberOfGuests = bookingDto.NumberOfGuests,
                TotalPrice = totalPrice,
                SpecialRequests = bookingDto.SpecialRequests,
                Status = BookingStatus.Pending,
                CreatedAt = DateTime.UtcNow
            };

            _context.Bookings.Add(booking);
            await _context.SaveChangesAsync();

            // Load navigation properties
            await _context.Entry(booking)
                .Reference(b => b.Room)
                .Query()
                .Include(r => r.Hotel)
                .LoadAsync();

            var response = _mapper.Map<BookingResponseDto>(booking);

            // Return with payment information
            return CreatedAtAction(nameof(GetBooking), new { id = booking.Id }, new
            {
                booking = response,
                requiresPayment = true,
                paymentEndpoint = $"/api/Payments/create-payment-intent/{booking.Id}"
            });
        }
        catch (UnauthorizedAccessException)
        {
            return Unauthorized();
        }
    }

    // PUT: api/Bookings/5/cancel  (cancel by integer id)
    [HttpPut("{id:int}/cancel")]
    public async Task<IActionResult> CancelBooking(int id)
    {
        var booking = await _context.Bookings.FindAsync(id);

        if (booking == null)
        {
            return NotFound();
        }

        // Can only cancel pending or confirmed bookings
        if (booking.Status == BookingStatus.Cancelled ||
            booking.Status == BookingStatus.Completed)
        {
            return BadRequest($"Cannot cancel booking with status {booking.Status}");
        }

        // Check if check-in date is too close
        if (booking.CheckInDate <= DateTime.Today.AddDays(1))
        {
            return BadRequest("Cannot cancel booking within 24 hours of check-in");
        }

        booking.Status = BookingStatus.Cancelled;
        booking.CancelledAt = DateTime.UtcNow;
        booking.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return NoContent();
    }

    // PUT: api/Bookings/HBP-A1B2C3/cancel  (cancel by booking reference string)
    [HttpPut("{reference}/cancel")]
    public async Task<IActionResult> CancelBookingByReference(string reference)
    {
        var booking = await _context.Bookings
            .FirstOrDefaultAsync(b => b.BookingReference == reference);

        if (booking == null)
        {
            return NotFound();
        }

        if (booking.Status == BookingStatus.Cancelled ||
            booking.Status == BookingStatus.Completed)
        {
            return BadRequest($"Cannot cancel booking with status {booking.Status}");
        }

        if (booking.CheckInDate <= DateTime.Today.AddDays(1))
        {
            return BadRequest("Cannot cancel booking within 24 hours of check-in");
        }

        booking.Status = BookingStatus.Cancelled;
        booking.CancelledAt = DateTime.UtcNow;
        booking.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return NoContent();
    }

    // GET: api/Bookings/check-availability
    [HttpGet("check-availability")]
    public async Task<ActionResult<bool>> CheckAvailability(
        [FromQuery] int roomId,
        [FromQuery] DateTime checkIn,
        [FromQuery] DateTime checkOut)
    {
        var isAvailable = await IsRoomAvailable(roomId, checkIn, checkOut);
        return Ok(isAvailable);
    }

    private async Task<bool> IsRoomAvailable(int roomId, DateTime checkIn, DateTime checkOut)
    {
        var conflictingBookings = await _context.Bookings
            .Where(b => b.RoomId == roomId &&
                   b.Status != BookingStatus.Cancelled &&
                   b.CheckInDate < checkOut &&
                   b.CheckOutDate > checkIn)
            .AnyAsync();

        return !conflictingBookings;
    }
}