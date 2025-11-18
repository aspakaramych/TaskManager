using AuthService.Core.Entities;
using AuthService.Core.Interfaces;
using AuthService.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Task = System.Threading.Tasks.Task;

namespace AuthService.Infrastructure.Repositories;

public class ProjectRepository : IProjectRepository
{
    private readonly AppDbContext _appDbContext;

    public ProjectRepository(AppDbContext appDbContext)
    {
        _appDbContext = appDbContext;
    }


    public async Task<Project> GetByIdAsync(Guid id)
    {
        return await _appDbContext.Projects.FindAsync(id);
    }

    public async Task<ICollection<Project>> GetAllAsync()
    {
        return await _appDbContext.Projects.ToListAsync();
    }

    public async Task AddAsync(Project entity)
    {
        await _appDbContext.Projects.AddAsync(entity);
    }

    public async Task UpdateAsync(Project entity)
    {
        _appDbContext.Projects.Update(entity);
    }

    public async Task DeleteAsync(Project entity)
    {
        _appDbContext.Projects.Remove(entity);
    }

    public async Task SaveChangesAsync()
    {
        await _appDbContext.SaveChangesAsync();
    }

    public async Task<ICollection<Project>> GetByTeamIdAsync(Guid teamId)
    {
        return await _appDbContext.Projects.Where(p => p.TeamId == teamId).ToListAsync();
    }

    public async Task<ICollection<Project>> GetByProjectManagerIdAsync(Guid projectManagerId)
    {
        return await _appDbContext.Projects.Where(p => p.ProjectManagerId == projectManagerId).ToListAsync();
    }

    public async Task<Project> GetWithTasksAsync(Guid projectId)
    {
        return await _appDbContext.Projects.Include(p => p.Tasks).FirstOrDefaultAsync(p => p.Id == projectId);
    }
}