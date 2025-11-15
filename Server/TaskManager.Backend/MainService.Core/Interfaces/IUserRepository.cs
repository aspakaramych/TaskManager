using MainService.Core.Entity;

namespace MainService.Core.Interfaces;

public interface IUserRepository
{
    Task<User?> GetUserByIdAsync(Guid userId);
}