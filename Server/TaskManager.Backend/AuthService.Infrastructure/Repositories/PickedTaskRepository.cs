using AuthService.Core.Entities;
using AuthService.Core.Interfaces;
using AuthService.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace AuthService.Infrastructure.Repositories;

public class PickedTaskRepository : IPickedTaskRepository
{
    private readonly AppDbContext _context;

    public PickedTaskRepository(AppDbContext context)
    {
        _context = context;
    }
    
    public async Task<PickedTask> GetByIdAsync(Guid id)
    {
        return await _context.PickedTasks.FindAsync(id);
    }

    public async Task<ICollection<PickedTask>> GetAllAsync()
    {
        return await _context.PickedTasks.ToListAsync();
    }

    public async Task AddAsync(PickedTask entity)
    {
        await _context.PickedTasks.AddAsync(entity);
    }

    public async Task UpdateAsync(PickedTask entity)
    {
        _context.PickedTasks.Update(entity);
    }

    public async Task DeleteAsync(PickedTask entity)
    {
        _context.PickedTasks.Remove(entity);
    }

    public async Task SaveChangesAsync()
    {
        await _context.SaveChangesAsync();
    }

    public async Task<PickedTask> GetByUserAndTaskAsync(Guid userId, Guid taskId)
    {
        return await _context.PickedTasks.FirstOrDefaultAsync(x => x.UserId == userId && x.TaskId == taskId);
    }

    public async Task<IEnumerable<PickedTask>> GetByUserIdAsync(Guid userId)
    {
        return await _context.PickedTasks.Where(x => x.UserId == userId).ToListAsync();
    }

    public async Task<IEnumerable<PickedTask>> GetByTaskIdAsync(Guid taskId)
    {
        return await _context.PickedTasks.Where(x => x.TaskId == taskId).ToListAsync();
    }

    public async Task<bool> IsTaskPickedByUserAsync(Guid userId, Guid taskId)
    {
        return await _context.PickedTasks.FirstOrDefaultAsync(x => x.UserId == userId && x.TaskId == taskId) != null;
    }
}