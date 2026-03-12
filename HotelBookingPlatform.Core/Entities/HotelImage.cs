using HotelBookingPlatform.Core.Entities.Base;

namespace HotelBookingPlatform.Core.Entities;

public class HotelImage : BaseEntity
{
    public string ImageUrl { get; set; } = string.Empty;
    public string? Caption { get; set; }
    public bool IsMainImage { get; set; }  // If true, this is the primary image
    public int DisplayOrder { get; set; }  // For sorting images

    // Foreign key
    public int HotelId { get; set; }
    public Hotel Hotel { get; set; } = null!;  // Changed from Hotel? to Hotel (required)
}