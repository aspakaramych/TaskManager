using MainService.Core.DTOs;
using MainService.Core.Entity;

namespace MainService.Core.Interfaces;

public interface ISubjectService
{
    Task<SubjectResponse> CreateSubject(SubjectRequest subject, Guid userId);
}