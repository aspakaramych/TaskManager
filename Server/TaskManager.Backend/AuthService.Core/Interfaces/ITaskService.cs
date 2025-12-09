using AuthService.Core.DTOs;

namespace AuthService.Core.Interfaces;

public interface ITaskService
{
    Task CreateTask(TaskCreateDto task, Guid projectId, Guid userId); 
    Task UpdateTask(TaskUpdateDto task, Guid projectId, Guid taskId, Guid userId);
    Task DeleteTask(Guid taskId, Guid userId, Guid projectId);
    Task<IEnumerable<TaskResponse>> GetTasks(Guid projectId);
    Task ConnectTask(Guid projectId, Guid userId, TaskConnect req);
    Task AssignTask(Guid taskId, Guid userId);
    Task<TaskInfo> GetTaskInfo(Guid projectId, Guid taskId);
    Task RejectTask(Guid taskId, Guid userId);
}