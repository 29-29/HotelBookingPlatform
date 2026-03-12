using HotelBookingPlatform.Core.DTOs;

namespace HotelBookingPlatform.Core.Interfaces;

public interface IPaymentService
{
    Task<PaymentIntentResponseDto> CreatePaymentIntentAsync(int bookingId);
    Task<bool> ConfirmPaymentAsync(int bookingId, string paymentIntentId);
    Task<bool> RefundPaymentAsync(int bookingId);
}