using AuthService.Core.Entities;
using AuthService.Core.Interfaces;
using AuthService.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Task = System.Threading.Tasks.Task;

namespace AuthService.Infrastructure.Repositories;

public class TeamRepository : ITeamRepository
{
    private readonly AppDbContext _context;

    public TeamRepository(AppDbContext context)
    {
        _context = context;
    }


    public async Task<Team> GetByIdAsync(Guid id)
    {
        return await _context.Teams.FindAsync(id);
    }

    public async Task<ICollection<Team>> GetAllAsync()
    {
        return await _context.Teams.ToListAsync();
    }

    public async Task AddAsync(Team entity)
    {
        await _context.Teams.AddAsync(entity);
    }

    public async Task UpdateAsync(Team entity)
    {
        _context.Teams.Update(entity);
    }

    public async Task DeleteAsync(Team entity)
    {
        _context.Teams.Remove(entity);
    }

    public async Task SaveChangesAsync()
    {
        await _context.SaveChangesAsync();
    }

    public async Task<Team> GetWithRolesAsync(Guid teamId)
    {
        return await _context.Teams.Include(t => t.TeamRoles).Where(t => t.Id == teamId).FirstOrDefaultAsync();
    }

    public async Task<IEnumerable<Team>> GetByUserIdAsync(Guid userId)
    {
        return await _context.Teams.Include(t => t.TeamRoles).Where(t => t.TeamRoles.Any(tr => tr.UserId == userId)).ToListAsync();
    }
}