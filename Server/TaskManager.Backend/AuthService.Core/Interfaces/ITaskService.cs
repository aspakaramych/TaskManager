using AuthService.Core.DTOs;

namespace AuthService.Core.Interfaces;

public interface ITaskService
{
    Task CreateTask(TaskCreateDto task, Guid projectId, Guid userId); 
    Task UpdateTask(TaskUpdateDto task, Guid projectId);
    Task DeleteTask(Guid taskId);
    Task<IEnumerable<TaskResponse>> GetTasks(Guid projectId);
    Task AssignTask(Guid taskId, Guid userId);    
}