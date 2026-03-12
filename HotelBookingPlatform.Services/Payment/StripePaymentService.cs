using HotelBookingPlatform.Core.Entities;
using HotelBookingPlatform.Core.Enums;
using HotelBookingPlatform.Core.Interfaces;
using HotelBookingPlatform.Core.DTOs;
using HotelBookingPlatform.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Stripe;

namespace HotelBookingPlatform.Services.Payment;

public class StripePaymentService : IPaymentService
{
    private readonly ApplicationDbContext _context;
    private readonly IConfiguration _configuration;
    private readonly ILogger<StripePaymentService> _logger;

    public StripePaymentService(
        ApplicationDbContext context,
        IConfiguration configuration,
        ILogger<StripePaymentService> logger)
    {
        _context = context;
        _configuration = configuration;
        _logger = logger;

        // Initialize Stripe with secret key
        StripeConfiguration.ApiKey = _configuration["Stripe:SecretKey"];
    }

    public async Task<PaymentIntentResponseDto> CreatePaymentIntentAsync(int bookingId)
    {
        try
        {
            // Get booking with room details
            var booking = await _context.Bookings
                .Include(b => b.Room)
                .FirstOrDefaultAsync(b => b.Id == bookingId);

            if (booking == null)
            {
                throw new InvalidOperationException("Booking not found");
            }

            if (booking.Payment != null)
            {
                throw new InvalidOperationException("Payment already exists for this booking");
            }

            // Calculate amount in cents (Stripe uses smallest currency unit)
            var amountInCents = (long)(booking.TotalPrice * 100);

            // Create payment intent options
            var options = new PaymentIntentCreateOptions
            {
                Amount = amountInCents,
                Currency = "usd",
                PaymentMethodTypes = new List<string> { "card" },
                Metadata = new Dictionary<string, string>
                {
                    { "bookingId", booking.Id.ToString() },
                    { "bookingReference", booking.BookingReference },
                    { "roomId", booking.RoomId.ToString() }
                }
            };

            var service = new PaymentIntentService();
            var paymentIntent = await service.CreateAsync(options);

            // Create payment record in database
            var payment = new HotelBookingPlatform.Core.Entities.Payment  // Fully qualified name
            {
                BookingId = booking.Id,
                Amount = booking.TotalPrice,
                Currency = "usd",
                PaymentMethod = "Stripe",
                Status = PaymentStatus.Pending,
                PaymentIntentId = paymentIntent.Id,
                CreatedAt = DateTime.UtcNow
            };

            _context.Payments.Add(payment);
            await _context.SaveChangesAsync();

            return new PaymentIntentResponseDto
            {
                ClientSecret = paymentIntent.ClientSecret,
                PaymentIntentId = paymentIntent.Id,
                Amount = booking.TotalPrice,
                Status = paymentIntent.Status
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating payment intent for booking {BookingId}", bookingId);
            throw;
        }
    }

    public async Task<bool> ConfirmPaymentAsync(int bookingId, string paymentIntentId)
    {
        try
        {
            var payment = await _context.Payments
                .Include(p => p.Booking)
                .FirstOrDefaultAsync(p => p.BookingId == bookingId && p.PaymentIntentId == paymentIntentId);

            if (payment == null)
            {
                throw new InvalidOperationException("Payment not found");
            }

            // Retrieve the payment intent from Stripe
            var service = new PaymentIntentService();
            var paymentIntent = await service.GetAsync(paymentIntentId);

            if (paymentIntent.Status == "succeeded")
            {
                payment.Status = PaymentStatus.Paid;
                payment.PaidAt = DateTime.UtcNow;

                // Update booking status
                var booking = payment.Booking;
                if (booking != null)
                {
                    booking.Status = BookingStatus.Confirmed;
                    booking.UpdatedAt = DateTime.UtcNow;
                }

                await _context.SaveChangesAsync();
                return true;
            }

            return false;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error confirming payment for booking {BookingId}", bookingId);
            throw;
        }
    }

    public async Task<bool> RefundPaymentAsync(int bookingId)
    {
        try
        {
            var payment = await _context.Payments
                .Include(p => p.Booking)
                .FirstOrDefaultAsync(p => p.BookingId == bookingId);

            if (payment == null)
            {
                throw new InvalidOperationException("Payment not found");
            }

            if (payment.Status != PaymentStatus.Paid)
            {
                throw new InvalidOperationException("Payment is not in a refundable state");
            }

            // Create refund in Stripe
            var options = new RefundCreateOptions
            {
                PaymentIntent = payment.PaymentIntentId
            };

            var service = new RefundService();
            var refund = await service.CreateAsync(options);

            if (refund.Status == "succeeded")
            {
                payment.Status = PaymentStatus.Refunded;
                payment.UpdatedAt = DateTime.UtcNow;

                // Update booking status
                var booking = payment.Booking;
                if (booking != null)
                {
                    booking.Status = BookingStatus.Cancelled;
                    booking.CancelledAt = DateTime.UtcNow;
                    booking.UpdatedAt = DateTime.UtcNow;
                }

                await _context.SaveChangesAsync();
                return true;
            }

            return false;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error refunding payment for booking {BookingId}", bookingId);
            throw;
        }
    }
}