using HotelBookingPlatform.Core.DTOs;
using HotelBookingPlatform.Core.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace HotelBookingPlatform.Server.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize]
public class PaymentsController : ControllerBase
{
    private readonly IPaymentService _paymentService;
    private readonly ILogger<PaymentsController> _logger;

    public PaymentsController(IPaymentService paymentService, ILogger<PaymentsController> logger)
    {
        _paymentService = paymentService;
        _logger = logger;
    }

    private int GetCurrentUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
        if (userIdClaim == null)
            throw new UnauthorizedAccessException("User not authenticated");
        return int.Parse(userIdClaim.Value);
    }

    [HttpPost("create-payment-intent/{bookingId}")]
    public async Task<ActionResult<PaymentIntentResponseDto>> CreatePaymentIntent(int bookingId)
    {
        try
        {
            var result = await _paymentService.CreatePaymentIntentAsync(bookingId);
            return Ok(result);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating payment intent");
            return StatusCode(500, new { message = "An error occurred processing your payment" });
        }
    }

    [HttpPost("confirm")]
    public async Task<ActionResult<bool>> ConfirmPayment(ConfirmPaymentDto confirmDto)
    {
        try
        {
            var result = await _paymentService.ConfirmPaymentAsync(confirmDto.BookingId, confirmDto.PaymentIntentId);
            return Ok(result);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error confirming payment");
            return StatusCode(500, new { message = "An error occurred confirming your payment" });
        }
    }

    [HttpPost("refund/{bookingId}")]
    public async Task<ActionResult<bool>> RefundPayment(int bookingId)
    {
        try
        {
            var result = await _paymentService.RefundPaymentAsync(bookingId);
            return Ok(result);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error refunding payment");
            return StatusCode(500, new { message = "An error occurred processing your refund" });
        }
    }
}