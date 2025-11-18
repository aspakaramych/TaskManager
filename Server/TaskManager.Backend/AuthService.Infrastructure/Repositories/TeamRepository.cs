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
        throw new NotImplementedException();
    }

    public async Task UpdateAsync(Team entity)
    {
        throw new NotImplementedException();
    }

    public async Task DeleteAsync(Team entity)
    {
        throw new NotImplementedException();
    }

    public async Task SaveChangesAsync()
    {
        throw new NotImplementedException();
    }

    public async Task<Team> GetWithRolesAsync(Guid teamId)
    {
        throw new NotImplementedException();
    }

    public async Task<IEnumerable<Team>> GetByUserIdAsync(Guid userId)
    {
        throw new NotImplementedException();
    }
}