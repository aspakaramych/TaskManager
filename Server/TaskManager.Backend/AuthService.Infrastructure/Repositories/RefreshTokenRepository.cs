using AuthService.Core.Entities;
using AuthService.Core.Interfaces;
using AuthService.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace AuthService.Infrastructure.Repositories;

public class RefreshTokenRepository : IRefreshTokenRepository
{
    private readonly AppDbContext _appDbContext;

    public RefreshTokenRepository(AppDbContext appDbContext)
    {
        _appDbContext = appDbContext;
    }

    public async Task<RefreshToken> GetRefreshToken(Guid refreshToken)
    {
        return await _appDbContext.RefreshTokens.Include(rt => rt.User)
            .FirstOrDefaultAsync(rt => rt.Token == refreshToken);
    }

    public async Task<ICollection<RefreshToken>> GetRefreshTokens(Guid userId)
    {
        return await _appDbContext.RefreshTokens.Where(rt => rt.UserId == userId).ToListAsync();
    }

    public async Task AddAsync(RefreshToken refreshToken)
    {
        await _appDbContext.RefreshTokens.AddAsync(refreshToken);
        await _appDbContext.SaveChangesAsync();
    }

    public async Task UpdateAsync(RefreshToken refreshToken)
    {
        _appDbContext.RefreshTokens.Update(refreshToken);
        await _appDbContext.SaveChangesAsync();
    }

    public async Task DeleteAsync(RefreshToken refreshToken)
    {
        _appDbContext.RefreshTokens.Remove(refreshToken);
        await _appDbContext.SaveChangesAsync();
    }

    public async Task DeleteExpiredAsync()
    {
        var expiredTokens = await _appDbContext.RefreshTokens.Where(rt => rt.Expires < DateTime.UtcNow).ToListAsync();
        _appDbContext.RefreshTokens.RemoveRange(expiredTokens);
        await _appDbContext.SaveChangesAsync();
    }
}