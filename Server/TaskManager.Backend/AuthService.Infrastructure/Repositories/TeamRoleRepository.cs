using AuthService.Core.Entities;
using AuthService.Core.Interfaces;
using AuthService.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace AuthService.Infrastructure.Repositories;

public class TeamRoleRepository : ITeamRoleRepository
{
    private readonly AppDbContext _appDbContext;

    public TeamRoleRepository(AppDbContext appDbContext)
    {
        _appDbContext = appDbContext;
    }

    public async Task<TeamRole> GetByIdAsync(Guid id)
    {
        return await _appDbContext.TeamRoles.FindAsync(id);
    }

    public async Task<ICollection<TeamRole>> GetAllAsync()
    {
        return await _appDbContext.TeamRoles.ToListAsync();
    }

    public async Task AddAsync(TeamRole entity)
    {
        await _appDbContext.TeamRoles.AddAsync(entity);
    }

    public async Task UpdateAsync(TeamRole entity)
    {
        _appDbContext.TeamRoles.Update(entity);
    }

    public async Task DeleteAsync(TeamRole entity)
    {
        _appDbContext.TeamRoles.Remove(entity);
    }

    public async Task SaveChangesAsync()
    {
        await _appDbContext.SaveChangesAsync();
    }

    public async Task<TeamRole> GetByUserAndTeamAsync(Guid userId, Guid teamId)
    {
        return await _appDbContext.TeamRoles
            .FirstOrDefaultAsync(tr => tr.UserId == userId && tr.TeamId == teamId);
    }

    public async Task<IEnumerable<TeamRole>> GetByTeamIdAsync(Guid teamId)
    {
        return await _appDbContext.TeamRoles.Where(tr => tr.TeamId == teamId).ToListAsync();
    }

    public async Task<IEnumerable<TeamRole>> GetByUserIdAsync(Guid userId)
    {
        return await _appDbContext.TeamRoles.Where(tr => tr.UserId == userId).ToListAsync();
    }

    public async Task<bool> UserHasRoleInTeamAsync(Guid userId, Guid teamId, RoleType role)
    {
        return await _appDbContext.TeamRoles
            .FirstOrDefaultAsync(tr => tr.UserId == userId && tr.TeamId == teamId) != null;
    }
}