using AuthService.Core.Entities;

namespace AuthService.Core.Interfaces;

public interface IPickedTaskRepository : IRepository<PickedTask>
{
    Task<PickedTask> GetByUserAndTaskAsync(Guid userId, Guid taskId);
    Task<IEnumerable<PickedTask>> GetByUserIdAsync(Guid userId);
    Task<IEnumerable<PickedTask>> GetByTaskIdAsync(Guid taskId);
    Task<bool> IsTaskPickedByUserAsync(Guid userId, Guid taskId);
}