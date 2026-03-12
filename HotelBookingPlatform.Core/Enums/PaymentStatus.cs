namespace HotelBookingPlatform.Core.Enums;

public enum PaymentStatus
{
    Pending,       // Awaiting payment
    Paid,          // Payment successful
    Failed,        // Payment failed
    Refunded,      // Money returned
    PartiallyRefunded
}