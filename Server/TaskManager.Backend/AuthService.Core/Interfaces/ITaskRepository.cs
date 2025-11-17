using AuthService.Core.Entity;
using Task = System.Threading.Tasks.Task;

namespace AuthService.Core.Interfaces;

public interface ITaskRepository
{
    Task AddTask(TaskEntity task);
    Task UpdateTask(TaskEntity task);
    Task DeleteTask(TaskEntity task);
}