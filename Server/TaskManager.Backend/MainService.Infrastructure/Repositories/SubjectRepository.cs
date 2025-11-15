using MainService.Core.Entity;
using MainService.Core.Interfaces;
using MainService.Infrastructure.Data;

namespace MainService.Infrastructure.Repositories;

public class SubjectRepository : ISubjectRepository
{
    private readonly AppDbContext _context;

    public SubjectRepository(AppDbContext context)
    {
        _context = context;
    }
    
    public async Task AddAsync(Subject subject)
    {
        await _context.Subjects.AddAsync(subject);
        await _context.SaveChangesAsync();
    }

    public async Task UpdateAsync(Subject subject)
    {
        _context.Subjects.Update(subject);
        await _context.SaveChangesAsync();
    }

    public async Task DeleteAsync(Subject subject)
    {
        _context.Subjects.Remove(subject);
        await _context.SaveChangesAsync();
    }
}