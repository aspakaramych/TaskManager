using AuthService.Core.Entities;
using AuthService.Core.Interfaces;
using AuthService.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace AuthService.Infrastructure.Repositories;

public class SubjectRepository : ISubjectRepository
{
    private readonly AppDbContext _appDbContext;

    public SubjectRepository(AppDbContext appDbContext)
    {
        _appDbContext = appDbContext;
    }


    public async Task<Subject> GetByIdAsync(Guid id)
    {
        return await _appDbContext.Subjects.FindAsync(id);
    }

    public async Task<ICollection<Subject>> GetAllAsync()
    {
        return await _appDbContext.Subjects.ToListAsync();
    }

    public async Task AddAsync(Subject entity)
    {
        await _appDbContext.Subjects.AddAsync(entity);
    }

    public async Task UpdateAsync(Subject entity)
    {
        _appDbContext.Subjects.Update(entity);
    }

    public async Task DeleteAsync(Subject entity)
    {
        _appDbContext.Subjects.Remove(entity);
    }

    public async Task SaveChangesAsync()
    {
        await _appDbContext.SaveChangesAsync();
    }

    public async Task<IEnumerable<Subject>> GetByTeacherIdAsync(Guid teacherId)
    {
        return await _appDbContext.Subjects.Where(x => x.TeacherId == teacherId).ToListAsync();
    }
}