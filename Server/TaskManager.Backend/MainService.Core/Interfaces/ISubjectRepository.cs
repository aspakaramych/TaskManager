using MainService.Core.Entity;

namespace MainService.Core.Interfaces;

public interface ISubjectRepository
{
    Task AddAsync(Subject subject);
    Task UpdateAsync(Subject subject);
    Task DeleteAsync(Subject subject);
}