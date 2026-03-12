using HotelBookingPlatform.Core.Entities.Base;
using HotelBookingPlatform.Core.Enums;

namespace HotelBookingPlatform.Core.Entities;

public class Booking : BaseEntity
{
    public string BookingReference { get; set; } = string.Empty;
    public DateTime CheckInDate { get; set; }
    public DateTime CheckOutDate { get; set; }
    public int NumberOfGuests { get; set; }
    public decimal TotalPrice { get; set; }
    public decimal? TaxAmount { get; set; }
    public decimal? DiscountAmount { get; set; }
    public string? SpecialRequests { get; set; }
    public BookingStatus Status { get; set; } = BookingStatus.Pending;
    public DateTime? CheckedInAt { get; set; }
    public DateTime? CheckedOutAt { get; set; }
    public DateTime? CancelledAt { get; set; }
    public string? CancellationReason { get; set; }

    // Foreign keys
    public int UserId { get; set; }
    public User? User { get; set; }

    public int RoomId { get; set; }
    public Room? Room { get; set; }

    // Navigation property for Payment - MAKE SURE THIS IS HERE
    public Payment? Payment { get; set; }
}