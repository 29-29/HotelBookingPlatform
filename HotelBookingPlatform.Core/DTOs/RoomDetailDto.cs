using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HotelBookingPlatform.Core.DTOs;

public class RoomDetailDto : RoomDto
{
    public string? Description { get; set; }
    public int BedCount { get; set; }
    public string? BedType { get; set; }
    public double SizeInSquareMeters { get; set; }
    public bool IsSmokingAllowed { get; set; }
    public List<string> Amenities { get; set; } = new();
}