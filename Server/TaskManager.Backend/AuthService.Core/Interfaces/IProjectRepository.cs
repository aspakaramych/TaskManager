using AuthService.Core.Entities;
using Task = System.Threading.Tasks.Task;

namespace AuthService.Core.Interfaces;

public interface IProjectRepository : IRepository<Project>
{
    Task<ICollection<Project>> GetByTeamIdAsync(Guid teamId);
    Task<ICollection<Project>> GetByProjectManagerIdAsync(Guid projectManagerId);
    Task<Project> GetWithTasksAsync(Guid projectId);
}