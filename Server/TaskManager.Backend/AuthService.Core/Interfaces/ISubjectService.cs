using AuthService.Core.DTOs;
using AuthService.Core.Entity;

namespace AuthService.Core.Interfaces;

public interface ISubjectService
{
    Task<SubjectResponse> CreateSubject(SubjectRequest subject, Guid userId);
}