using AuthService.Core.Entities;

namespace AuthService.Core.Interfaces;

public interface IRefreshTokenRepository
{
    Task<RefreshToken> GetRefreshToken(Guid refreshToken);
    Task<ICollection<RefreshToken>> GetRefreshTokens(Guid userId);
    Task AddAsync(RefreshToken refreshToken);
    Task UpdateAsync(RefreshToken refreshToken);
    Task DeleteAsync(RefreshToken refreshToken);
    Task DeleteExpiredAsync();
    
}