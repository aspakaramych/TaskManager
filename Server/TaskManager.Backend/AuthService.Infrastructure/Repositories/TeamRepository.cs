using AuthService.Core.Entity;
using AuthService.Core.Interfaces;
using AuthService.Infrastructure.Data;
using Task = System.Threading.Tasks.Task;

namespace AuthService.Infrastructure.Repositories;

public class TeamRepository : ITeamRepository
{
    private readonly AppDbContext _context;

    public TeamRepository(AppDbContext context)
    {
        _context = context;
    }
    
    public async Task AddTeam(Team team, Guid userId)
    {
        await _context.Teams.AddAsync(team);
        var userRole = new TeamRole
        {
            UserId = userId,
            TeamId = team.Id,
            Role = RoleType.ProjectManager,
        };
        await _context.TeamRoles.AddAsync(userRole);
        await _context.SaveChangesAsync();
    }

    public async Task DeleteTeam(Team team)
    {
        _context.Teams.Remove(team);
        await _context.SaveChangesAsync();
    }

    public async Task AddUserToTeam(Guid userId, Guid teamId, RoleType role)
    {
        var userRole = new TeamRole
        {
            UserId = userId,
            TeamId = teamId,
            Role = role
        };
        await _context.TeamRoles.AddAsync(userRole);
        await _context.SaveChangesAsync();
    }
}