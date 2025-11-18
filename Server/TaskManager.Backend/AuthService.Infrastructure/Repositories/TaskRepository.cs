using AuthService.Core.Entities;
using AuthService.Core.Interfaces;
using AuthService.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace AuthService.Infrastructure.Repositories;

public class TaskRepository : ITaskRepository
{
    private readonly AppDbContext _appDbContext;

    public TaskRepository(AppDbContext appDbContext)
    {
        _appDbContext = appDbContext;
    }


    public async Task<TaskEntity> GetByIdAsync(Guid id)
    {
        return await _appDbContext.Tasks.FindAsync(id);
    }

    public async Task<ICollection<TaskEntity>> GetAllAsync()
    {
        return await _appDbContext.Tasks.ToListAsync();
    }

    public async Task AddAsync(TaskEntity entity)
    {
        await _appDbContext.Tasks.AddAsync(entity);
    }

    public async Task UpdateAsync(TaskEntity entity)
    {
        _appDbContext.Tasks.Update(entity);
    }

    public async Task DeleteAsync(TaskEntity entity)
    {
        _appDbContext.Tasks.Remove(entity);
    }

    public async Task SaveChangesAsync()
    {
        await _appDbContext.SaveChangesAsync();
    }

    public async Task<IEnumerable<TaskEntity>> GetByProjectIdAsync(Guid projectId)
    {
        return await _appDbContext.Tasks.Where(t => t.ProjectId == projectId).ToListAsync();
    }

    public async Task<IEnumerable<TaskEntity>> GetByTaskHeadIdAsync(Guid taskHeadId)
    {
        return await _appDbContext.Tasks.Where(t => t.TaskHeadId == taskHeadId).ToListAsync();
    }

    public async Task<IEnumerable<TaskEntity>> GetTasksWithChildrenAsync(Guid taskId)
    {
        return await _appDbContext.Tasks.Include(t => t.Children).Where(t => t.Id == taskId).ToListAsync();
    }

    public async Task UpdateTaskProgressAsync(Guid taskId, TaskProgress progress)
    {
        var task = await _appDbContext.Tasks.FindAsync(taskId);
        task.Progress = progress;
    }
}