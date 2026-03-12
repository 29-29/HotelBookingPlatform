using HotelBookingPlatform.Core.Entities.Base;

namespace HotelBookingPlatform.Core.Entities;

public class RoomAmenity : BaseEntity
{
    public string Name { get; set; } = string.Empty;  // e.g., "Air Conditioning", "TV", "Mini Bar"
    public string? IconUrl { get; set; }

    // Foreign key
    public int RoomId { get; set; }
    public Room Room { get; set; } = null!;  // Changed from Room? to Room (required)
}