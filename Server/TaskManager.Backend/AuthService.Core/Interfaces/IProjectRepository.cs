using AuthService.Core.Entity;
using Task = System.Threading.Tasks.Task;

namespace AuthService.Core.Interfaces;

public interface IProjectRepository
{
    Task AddAsync(Project project);
    Task UpdateAsync(Project project);
    Task DeleteAsync(Project project);
    Task<ICollection<Project>> GetProjectsForUserAsync(Guid userId);
}