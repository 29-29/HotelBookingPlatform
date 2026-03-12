using HotelBookingPlatform.Core.Entities;

namespace HotelBookingPlatform.Core.Interfaces;

public interface IJwtService
{
    string GenerateToken(User user);
}