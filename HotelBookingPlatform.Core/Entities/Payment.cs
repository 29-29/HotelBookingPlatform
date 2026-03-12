using HotelBookingPlatform.Core.Entities.Base;
using HotelBookingPlatform.Core.Enums;

namespace HotelBookingPlatform.Core.Entities;

public class Payment : BaseEntity
{
    public decimal Amount { get; set; }
    public string Currency { get; set; } = "USD";
    public string PaymentMethod { get; set; } = string.Empty;  // Credit Card, PayPal, etc.
    public string? TransactionId { get; set; }  // From payment gateway
    public PaymentStatus Status { get; set; } = PaymentStatus.Pending;
    public DateTime? PaidAt { get; set; }
    public string? PaymentIntentId { get; set; }  // For Stripe
    public string? LastFourDigits { get; set; }   // For credit card
    public string? ReceiptUrl { get; set; }

    // Foreign key
    public int BookingId { get; set; }
    public Booking? Booking { get; set; }
}