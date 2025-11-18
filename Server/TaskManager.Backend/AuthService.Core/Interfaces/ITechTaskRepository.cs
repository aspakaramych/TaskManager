using AuthService.Core.Entities;

namespace AuthService.Core.Interfaces;

public interface ITechTaskRepository : IRepository<TechTask>
{
    Task<IEnumerable<TechTask>> GetBySubjectIdAsync(Guid subjectId);
}