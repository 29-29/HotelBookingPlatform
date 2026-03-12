namespace HotelBookingPlatform.Core.DTOs;

public class CreatePaymentIntentDto
{
    public int BookingId { get; set; }
    public string PaymentMethodId { get; set; } = string.Empty;
}

public class PaymentIntentResponseDto
{
    public string ClientSecret { get; set; } = string.Empty;
    public string PaymentIntentId { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public string Status { get; set; } = string.Empty;
}

public class ConfirmPaymentDto
{
    public int BookingId { get; set; }
    public string PaymentIntentId { get; set; } = string.Empty;
}