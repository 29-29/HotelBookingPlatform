using HotelBookingPlatform.Core.Entities.Base;

namespace HotelBookingPlatform.Core.Entities;

public class Review : BaseEntity
{
    public int Rating { get; set; }  // 1-5 stars
    public string? Comment { get; set; }
    public string? ResponseFromHotel { get; set; }  // Hotel can respond to reviews
    public DateTime? ResponseDate { get; set; }

    // Optional: separate ratings for different aspects
    public int? CleanlinessRating { get; set; }
    public int? ComfortRating { get; set; }
    public int? LocationRating { get; set; }
    public int? ServiceRating { get; set; }
    public int? ValueForMoneyRating { get; set; }

    // Foreign keys
    public int UserId { get; set; }
    public User? User { get; set; }

    public int HotelId { get; set; }
    public Hotel? Hotel { get; set; }

    // Optional: if review is for a specific booking
    public int? BookingId { get; set; }
    public Booking? Booking { get; set; }
}