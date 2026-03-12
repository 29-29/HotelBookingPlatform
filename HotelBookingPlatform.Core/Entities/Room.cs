using HotelBookingPlatform.Core.Entities.Base;
using HotelBookingPlatform.Core.Enums;

namespace HotelBookingPlatform.Core.Entities;

public class Room : BaseEntity
{
    public string RoomNumber { get; set; } = string.Empty;
    public string RoomType { get; set; } = string.Empty;  // Single, Double, Suite, etc.
    public string? Description { get; set; }
    public decimal PricePerNight { get; set; }
    public int Capacity { get; set; }  // Max number of guests
    public int BedCount { get; set; }
    public string? BedType { get; set; }  // King, Queen, Twin, etc.
    public double SizeInSquareMeters { get; set; }
    public bool IsSmokingAllowed { get; set; }
    public RoomStatus Status { get; set; } = RoomStatus.Available;
    public string? ThumbnailUrl { get; set; }

    // Foreign key
    public int HotelId { get; set; }
    public Hotel? Hotel { get; set; }

    // Navigation properties - THESE WERE MISSING
    public ICollection<Booking> Bookings { get; set; } = new List<Booking>();
    public ICollection<RoomImage> Images { get; set; } = new List<RoomImage>();
    public ICollection<RoomAmenity> RoomAmenities { get; set; } = new List<RoomAmenity>();
}