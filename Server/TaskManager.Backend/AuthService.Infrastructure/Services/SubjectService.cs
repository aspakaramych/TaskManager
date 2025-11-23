using AuthService.Core.DTOs;
using AuthService.Core.Entities;
using AuthService.Core.Interfaces;

namespace AuthService.Infrastructure.Services;

public class SubjectService : ISubjectService
{
    private readonly ISubjectRepository _subjectRepository;

    public SubjectService(ISubjectRepository subjectRepository) 
    {
        _subjectRepository = subjectRepository;    
    }
    
    public async Task<SubjectResponse> CreateSubject(SubjectRequest subject, Guid userId)
    {
        var subjectEntity = new Subject
        {
            Id = Guid.NewGuid(),
            Name = subject.Name,
            TeacherId = userId,
        };
        await _subjectRepository.AddAsync(subjectEntity);
        await _subjectRepository.SaveChangesAsync();
        var response = new SubjectResponse
        {
            Id = subjectEntity.Id,
        };
        return response;
    }

    public async Task<IEnumerable<SubjectGetResponse>> GetSubjects(Guid userId)
    {
        var subjects = await _subjectRepository.GetByTeacherIdAsync(userId);
        var response = subjects.Select(s => new SubjectGetResponse
        {
            Id = s.Id,
            Name = s.Name,
        });
        return response;
    }
}