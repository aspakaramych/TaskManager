using AuthService.Core.DTOs;

namespace AuthService.Core.Interfaces;

public interface IProjectService
{
    Task<ICollection<ProjectGetDto>> GetProjects(Guid userId);
    Task CreateProject(ProjectCreateDto createDto, Guid userId);
    Task UpdateProject(ProjectUpdateDto updateDto, Guid userId);
    Task DeleteProject(Guid projectId, Guid userId);
}