using HotelBookingPlatform.Core.Entities.Base;

namespace HotelBookingPlatform.Core.Entities;

public class Amenity : BaseEntity
{
    public string Name { get; set; } = string.Empty;  // e.g., "WiFi", "Pool", "Parking"
    public string? Description { get; set; }
    public string? IconUrl { get; set; }  // Font Awesome or image icon

    // Navigation properties - THIS WAS MISSING
    public ICollection<Hotel> Hotels { get; set; } = new List<Hotel>();
}