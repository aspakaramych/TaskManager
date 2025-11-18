using AuthService.Core.Entities;

namespace AuthService.Core.Interfaces;

public interface ITeamRoleRepository : IRepository<TeamRole>
{
    Task<TeamRole> GetByUserAndTeamAsync(Guid userId, Guid teamId);
    Task<IEnumerable<TeamRole>> GetByTeamIdAsync(Guid teamId);
    Task<IEnumerable<TeamRole>> GetByUserIdAsync(Guid userId);
    Task<bool> UserHasRoleInTeamAsync(Guid userId, Guid teamId, RoleType role);
}