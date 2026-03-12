using HotelBookingPlatform.Core.Entities.Base;

namespace HotelBookingPlatform.Core.Entities;

public class RoomImage : BaseEntity
{
    public string ImageUrl { get; set; } = string.Empty;
    public string? Caption { get; set; }

    // Foreign key
    public int RoomId { get; set; }
    public Room Room { get; set; } = null!;  // Changed from Room? to Room (required)
}