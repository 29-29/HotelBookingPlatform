using HotelBookingPlatform.Infrastructure.Data;
using HotelBookingPlatform.Core.Entities;
using HotelBookingPlatform.Core.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using AutoMapper;

namespace HotelBookingPlatform.Server.Controllers;

[Route("api/[controller]")]
[ApiController]
public class HotelsController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly IMapper _mapper;

    public HotelsController(ApplicationDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    // GET: api/Hotels
    [HttpGet]
    public async Task<ActionResult<IEnumerable<HotelDto>>> GetHotels()
    {
        var hotels = await _context.Hotels
            .Include(h => h.Rooms)
            .ToListAsync();

        return Ok(_mapper.Map<IEnumerable<HotelDto>>(hotels));
    }

    // GET: api/Hotels/5
    [HttpGet("{id}")]
    public async Task<ActionResult<HotelDetailDto>> GetHotel(int id)
    {
        var hotel = await _context.Hotels
            .Include(h => h.Rooms)
                .ThenInclude(r => r.RoomAmenities)
            .Include(h => h.Amenities)
            .Include(h => h.Reviews)
                .ThenInclude(r => r.User)
            .FirstOrDefaultAsync(h => h.Id == id);

        if (hotel == null)
        {
            return NotFound();
        }

        return Ok(_mapper.Map<HotelDetailDto>(hotel));
    }

    // GET: api/Hotels/5/rooms
    [HttpGet("{hotelId}/rooms")]
    public async Task<ActionResult<IEnumerable<RoomDetailDto>>> GetRoomsByHotel(int hotelId)
    {
        var rooms = await _context.Rooms
            .Include(r => r.RoomAmenities)
            .Where(r => r.HotelId == hotelId)
            .ToListAsync();

        return Ok(_mapper.Map<IEnumerable<RoomDetailDto>>(rooms));
    }

    // POST: api/Hotels  (Admin only)
    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<HotelDto>> CreateHotel([FromBody] CreateHotelDto dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var hotel = new Hotel
        {
            Name = dto.Name,
            Description = dto.Description,
            Address = dto.Address,
            City = dto.City,
            Country = dto.Country,
            PostalCode = dto.PostalCode,
            StarRating = dto.StarRating,
            PhoneNumber = dto.PhoneNumber,
            Email = dto.Email,
            Website = dto.Website,
            CheckInTime = dto.CheckInTime ?? "15:00",
            CheckOutTime = dto.CheckOutTime ?? "11:00",
            MainImageUrl = dto.MainImageUrl,
            CreatedAt = DateTime.UtcNow
        };

        _context.Hotels.Add(hotel);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetHotel), new { id = hotel.Id }, _mapper.Map<HotelDto>(hotel));
    }

    // PUT: api/Hotels/5  (Admin only)
    [HttpPut("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> UpdateHotel(int id, [FromBody] UpdateHotelDto dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var hotel = await _context.Hotels.FindAsync(id);
        if (hotel == null)
            return NotFound();

        hotel.Name = dto.Name;
        hotel.Description = dto.Description;
        hotel.Address = dto.Address;
        hotel.City = dto.City;
        hotel.Country = dto.Country;
        hotel.PostalCode = dto.PostalCode;
        hotel.StarRating = dto.StarRating;
        hotel.PhoneNumber = dto.PhoneNumber;
        hotel.Email = dto.Email;
        hotel.Website = dto.Website;
        hotel.CheckInTime = dto.CheckInTime ?? hotel.CheckInTime;
        hotel.CheckOutTime = dto.CheckOutTime ?? hotel.CheckOutTime;
        hotel.MainImageUrl = dto.MainImageUrl;
        hotel.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return Ok(_mapper.Map<HotelDto>(hotel));
    }

    // DELETE: api/Hotels/5  (Admin only)
    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> DeleteHotel(int id)
    {
        var hotel = await _context.Hotels.FindAsync(id);
        if (hotel == null)
            return NotFound();

        _context.Hotels.Remove(hotel);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}