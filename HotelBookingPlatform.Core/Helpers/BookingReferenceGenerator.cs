namespace HotelBookingPlatform.Core.Helpers;

public static class BookingReferenceGenerator
{
    public static string GenerateReference()
    {
        // Format: HOTEL-YYYYMMDD-XXXX (e.g., HOTEL-20240315-ABC1)
        var datePart = DateTime.Now.ToString("yyyyMMdd");
        var randomPart = Guid.NewGuid().ToString().Substring(0, 4).ToUpper();

        return $"HOTEL-{datePart}-{randomPart}";
    }
}