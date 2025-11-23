using AuthService.Core.Entities;
using AuthService.Core.Interfaces;
using AuthService.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace AuthService.Infrastructure.Repositories;

public class TechTaskRepository : ITechTaskRepository
{
    private readonly AppDbContext _appDbContext;

    public TechTaskRepository(AppDbContext appDbContext)
    {
        _appDbContext = appDbContext;
    }

    public async Task<TechTask> GetByIdAsync(Guid id)
    {
        return await _appDbContext.TechTasks.FindAsync(id);
    }

    public async Task<ICollection<TechTask>> GetAllAsync()
    {
        return await _appDbContext.TechTasks.ToListAsync();
    }

    public async Task AddAsync(TechTask entity)
    {
        await _appDbContext.TechTasks.AddAsync(entity);
    }

    public async Task UpdateAsync(TechTask entity)
    {
        _appDbContext.TechTasks.Update(entity);
    }

    public async Task DeleteAsync(TechTask entity)
    {
        _appDbContext.TechTasks.Remove(entity);
    }

    public async Task SaveChangesAsync()
    {
        await _appDbContext.SaveChangesAsync();
    }

    public async Task<IEnumerable<TechTask>> GetBySubjectIdAsync(Guid subjectId)
    {
        return await _appDbContext.TechTasks.Where(t => t.SubjectId == subjectId).ToListAsync();
    }
}