using AuthService.Core.Entities;

namespace AuthService.Core.Interfaces;

public interface ISubjectRepository : IRepository<Subject>
{
    Task<IEnumerable<Subject>> GetByTeacherIdAsync(Guid teacherId);
}