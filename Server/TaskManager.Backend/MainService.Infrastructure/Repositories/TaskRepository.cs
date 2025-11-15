using MainService.Core.Entity;
using MainService.Core.Interfaces;
using MainService.Infrastructure.Data;

namespace MainService.Infrastructure.Repositories;

public class TaskRepository : ITaskRepository
{
    private readonly AppDbContext _appDbContext;

    public TaskRepository(AppDbContext appDbContext)
    {
        _appDbContext = appDbContext;
    }

    public async Task AddTask(TaskEntity task)
    {
        await _appDbContext.Tasks.AddAsync(task);
        await _appDbContext.SaveChangesAsync();
    }

    public async Task UpdateTask(TaskEntity task)
    {
        _appDbContext.Tasks.Update(task);
        await _appDbContext.SaveChangesAsync();
    }

    public async Task DeleteTask(TaskEntity task)
    {
        _appDbContext.Tasks.Remove(task);
        await _appDbContext.SaveChangesAsync();
    }
}