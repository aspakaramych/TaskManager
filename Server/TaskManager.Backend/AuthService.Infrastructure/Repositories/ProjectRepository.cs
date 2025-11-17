using AuthService.Core.Entity;
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
    
    public async Task AddAsync(Project project)
    {
        await _appDbContext.Projects.AddAsync(project);
        await _appDbContext.SaveChangesAsync();
    }

    public async Task UpdateAsync(Project project)
    {
        _appDbContext.Projects.Update(project);
        await _appDbContext.SaveChangesAsync();
    }

    public async Task DeleteAsync(Project project)
    {
        _appDbContext.Projects.Remove(project);
        await _appDbContext.SaveChangesAsync();
    }

    public async Task<ICollection<Project>> GetProjectsForUserAsync(Guid userId)
    {
        return await _appDbContext.Projects.Where(p => p.Team.TeamRoles.Any(role => role.UserId == userId)).ToListAsync();
    }
}