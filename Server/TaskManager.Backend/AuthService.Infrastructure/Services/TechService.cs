using AuthService.Core.DTOs;
using AuthService.Core.Entities;
using AuthService.Core.Interfaces;

namespace AuthService.Infrastructure.Services;

public class TechService : ITechService
{
    private readonly ITechTaskRepository _techTaskRepository;
    private readonly ISubjectRepository _subjectRepository;

    public TechService(ITechTaskRepository techTaskRepository, ISubjectRepository subjectRepository)
    {
        _techTaskRepository = techTaskRepository;
        _subjectRepository = subjectRepository;
    }

    public async Task<TechTaskGetDto> CreateTechTaskAsync(TechTaskCreateDto dto, Guid teacherId, Guid subjectId)
    {
        // 1. Проверяем, существует ли предмет
        var subject = await _subjectRepository.GetByIdAsync(subjectId);
        if (subject == null)
            throw new KeyNotFoundException("Предмет не найден.");

        // 2. Проверяем права: только преподаватель этого предмета может создать ТЗ
        if (subject.TeacherId != teacherId)
            throw new UnauthorizedAccessException("Только преподаватель этого предмета может добавлять технические задания.");

        // 3. Создаем сущность
        var techTask = new TechTask
        {
            Id = Guid.NewGuid(),
            Description = dto.Description,
            Deadline = dto.Deadline, // DateTime из DTO
            SubjectId = subjectId
        };

        await _techTaskRepository.AddAsync(techTask);

        // 4. Возвращаем результат
        return new TechTaskGetDto
        {
            Id = techTask.Id,
            Description = techTask.Description,
            Deadline = techTask.Deadline
        };
    }

    public async Task<IEnumerable<TechTaskGetDto>> GetTechTasksBySubjectIdAsync(Guid subjectId)
    {
        var tasks = await _techTaskRepository.GetBySubjectIdAsync(subjectId);

        return tasks.Select(t => new TechTaskGetDto
        {
            Id = t.Id,
            Description = t.Description,
            Deadline = t.Deadline
        });
    }

    public async Task UpdateTechTaskAsync(Guid techTaskId, TechTaskCreateDto dto, Guid teacherId, Guid subjectId)
    {
        var techTask = await _techTaskRepository.GetByIdAsync(techTaskId);
        if (techTask == null)
            throw new KeyNotFoundException("Техническое задание не найдено.");

        // Проверка прав через предмет
        var subject = await _subjectRepository.GetByIdAsync(techTask.SubjectId);
        if (subject == null || subject.TeacherId != teacherId)
            throw new UnauthorizedAccessException("Вы не являетесь преподавателем этого предмета.");

        techTask.Description = dto.Description;
        techTask.Deadline = dto.Deadline;
        
        // Если вдруг решили перенести ТЗ на другой предмет (редкий кейс, но возможный)
        if (subjectId != Guid.Empty && subjectId != techTask.SubjectId)
        {
             var newSubject = await _subjectRepository.GetByIdAsync(subjectId);
             if (newSubject == null || newSubject.TeacherId != teacherId)
                 throw new UnauthorizedAccessException("Нельзя перенести ТЗ в предмет, который вы не ведете.");
             techTask.SubjectId = subjectId;
        }

        await _techTaskRepository.UpdateAsync(techTask);
    }

    public async Task DeleteTechTaskAsync(Guid techTaskId, Guid teacherId)
    {
        var techTask = await _techTaskRepository.GetByIdAsync(techTaskId);
        if (techTask == null)
            throw new KeyNotFoundException("Техническое задание не найдено.");

        var subject = await _subjectRepository.GetByIdAsync(techTask.SubjectId);
        if (subject == null || subject.TeacherId != teacherId)
            throw new UnauthorizedAccessException("Вы не можете удалить это ТЗ.");

        await _techTaskRepository.DeleteAsync(techTask);
    }
}