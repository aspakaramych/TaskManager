using AuthService.Core.Entities;

namespace AuthService.Core.Interfaces;

public interface ITokenService
{
    string GenerateAccessToken(User user);
    RefreshToken GenerateRefreshToken(Guid userId);
    string GetUserIdFromToken(string token);
}