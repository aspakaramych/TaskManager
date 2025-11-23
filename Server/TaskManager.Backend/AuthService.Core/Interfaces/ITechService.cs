using AuthService.Core.DTOs;

namespace AuthService.Core.Interfaces;

public interface ITechService
{
    Task<TechTaskGetDto> CreateTechTaskAsync(TechTaskCreateDto dto, Guid teacherId, Guid subjectId);

    Task<IEnumerable<TechTaskGetDto>> GetTechTasksBySubjectIdAsync(Guid subjectId);

    Task UpdateTechTaskAsync(Guid techTaskId, TechTaskCreateDto dto, Guid teacherId, Guid subjectId);

    Task DeleteTechTaskAsync(Guid techTaskId, Guid teacherId);
}