namespace HotelBookingPlatform.Core.Enums;

public enum BookingStatus
{
    Pending,      // Booking created but not confirmed
    Confirmed,    // Booking confirmed
    Cancelled,    // Booking cancelled by user
    Completed,    // Stay completed
    NoShow        // User didn't show up
}