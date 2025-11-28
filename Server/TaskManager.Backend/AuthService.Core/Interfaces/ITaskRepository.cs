using AuthService.Core.Entities;

namespace AuthService.Core.Interfaces;

public interface ITaskRepository : IRepository<TaskEntity>
{
    Task<IEnumerable<TaskEntity>> GetByProjectIdAsync(Guid projectId);
    Task<IEnumerable<TaskEntity>> GetByTaskHeadIdAsync(Guid taskHeadId);
    Task<IEnumerable<TaskEntity>> GetTasksWithChildrenAsync(Guid taskId);
    Task UpdateTaskProgressAsync(Guid taskId, TaskProgress progress);
    
    Task<IEnumerable<TaskEntity>> GetProjectTasksAsTreeAsync(Guid projectId);
}