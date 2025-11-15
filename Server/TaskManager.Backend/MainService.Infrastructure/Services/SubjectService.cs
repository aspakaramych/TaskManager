using MainService.Core.DTOs;
using MainService.Core.Entity;
using MainService.Core.Interfaces;

namespace MainService.Infrastructure.Services;

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
        var response = new SubjectResponse
        {
            Id = subjectEntity.Id,
        };
        return response;
    }
}