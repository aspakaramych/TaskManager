using AuthService.Core.DTOs;

namespace AuthService.Core.Interfaces;

public interface ISubjectService
{
    Task<SubjectResponse> CreateSubject(SubjectRequest subject, Guid userId);
}