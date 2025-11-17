using AuthService.Core.Entity;

namespace AuthService.Core.Interfaces;

public interface ISubjectRepository
{
    Task AddAsync(Subject subject);
    Task UpdateAsync(Subject subject);
    Task DeleteAsync(Subject subject);
}