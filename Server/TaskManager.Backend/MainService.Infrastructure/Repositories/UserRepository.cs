using MainService.Core.Entity;
using MainService.Core.Interfaces;
using MainService.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace MainService.Infrastructure.Repositories;

public class UserRepository : IUserRepository
{
    private readonly AppDbContext _appDbContext;

    public UserRepository(AppDbContext appDbContext)
    {
        _appDbContext = appDbContext;
    }

    public async Task<User?> GetUserByIdAsync(Guid userId)
    {
        return await _appDbContext.Users.FirstOrDefaultAsync(u => u.Id == userId);
    }
}