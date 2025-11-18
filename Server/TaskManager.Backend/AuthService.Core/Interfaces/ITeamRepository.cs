using AuthService.Core.Entities;

namespace AuthService.Core.Interfaces;

public interface ITeamRepository : IRepository<Team>
{
    Task<Team> GetWithRolesAsync(Guid teamId);
    Task<IEnumerable<Team>> GetByUserIdAsync(Guid userId);
}