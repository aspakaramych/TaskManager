using AuthService.Core.Entity;
using Task = System.Threading.Tasks.Task;

namespace AuthService.Core.Interfaces;

public interface ITeamRepository
{
    Task AddTeam(Team team, Guid userId);
    Task DeleteTeam(Team team);
    Task AddUserToTeam(Guid userId, Guid teamId, RoleType role);
}