using AuthService.Core.DTOs;
using AuthService.Core.Entities;
using AuthService.Core.Interfaces;
using AuthService.Infrastructure.Repositories;
using System.Linq;
using Microsoft.Extensions.Logging;

namespace AuthService.Infrastructure.Services;

public class ProjectService : IProjectService
{
    private readonly IProjectRepository _projectRepository;
    private readonly ITeamRoleRepository _teamRoleRepository;
    private readonly ITeamRepository _teamRepository;
    private readonly ITaskService _taskService;
    private readonly IUserRepository _userRepository;
    private readonly ILogger<ProjectService> _logger;

    public ProjectService(
        IProjectRepository projectRepository, 
        ITeamRoleRepository teamRoleRepository,
        ITeamRepository teamRepository,
        ILogger<ProjectService> logger, ITaskService taskService, IUserRepository userRepository) 
    {
        _projectRepository = projectRepository;
        _teamRoleRepository = teamRoleRepository;
        _teamRepository = teamRepository;
        _logger = logger;
        _taskService = taskService;
        _userRepository = userRepository;
    }
    
    public async Task<ICollection<ProjectGetDto>> GetProjects(Guid userId)
    {
        var teamRoles = await _teamRoleRepository.GetByUserIdAsync(userId);
        var teamIds = teamRoles.Select(tr => tr.TeamId).Distinct();
      
        var projects = new List<Project>();
        foreach (var teamId in teamIds)
        {
            var teamProjects = await _projectRepository.GetByTeamIdAsync(teamId);
            projects.AddRange(teamProjects);
        }
        
        var distinctProjects = projects
            .GroupBy(p => p.Id)
            .Select(g => g.First())
            .ToList();
        
        var projectDtos = new List<ProjectGetDto>();
        foreach (var project in distinctProjects)
        {
            var roleInProject = teamRoles
                .FirstOrDefault(tr => tr.TeamId == project.TeamId)?.Role.ToString() ?? "None";

            projectDtos.Add(new ProjectGetDto
            {
                Id = project.Id,
                Title = project.Title,
                Description = project.Description,
                Role = roleInProject,
                TeamId = project.TeamId
            });
        }

        return projectDtos;
    }

    public async Task CreateProject(ProjectCreateDto createDto, Guid userId)
    {
        _logger.LogInformation("Creating project for user {userId}", userId);
        var newTeam = new Team
        {
            Id = Guid.NewGuid(),
            Title = $"Команда проекта {createDto.Title}",
            Description = "Автоматически созданная команда",
        };
        var pmRole = new TeamRole
        {
            UserId = userId,
            TeamId = newTeam.Id,
            Role = RoleType.ProjectManager
        };
        
        var project = new Project
        {
            Id = Guid.NewGuid(),
            Title = createDto.Title,
            Description = createDto.Description,
            TeamId = newTeam.Id, 
            ProjectManagerId = userId 
        };
        newTeam.ProjectId = project.Id;
        await _teamRepository.AddAsync(newTeam);
        await _projectRepository.AddAsync(project);
        await _teamRoleRepository.AddAsync(pmRole);
        await _projectRepository.SaveChangesAsync();
    }

    public async Task UpdateProject(ProjectUpdateDto updateDto, Guid userId)
    {
        var project = await _projectRepository.GetByIdAsync(updateDto.Id)
            ?? throw new KeyNotFoundException("Project not found.");

        var teamRoles = await _teamRoleRepository.GetByUserIdAsync(userId);
        var role = teamRoles.FirstOrDefault(tr => tr.TeamId == project.TeamId)?.Role.ToString();

        if (role != "ProjectManager")
            throw new UnauthorizedAccessException("Only ProjectManager can update the project.");
        
        if (!string.IsNullOrWhiteSpace(updateDto.Title))
            project.Title = updateDto.Title;
        if (updateDto.Description != null)
            project.Description = updateDto.Description;

        await _projectRepository.UpdateAsync(project);
    }

    public async Task DeleteProject(Guid projectId, Guid userId)
    {
        var project = await _projectRepository.GetByIdAsync(projectId)
            ?? throw new KeyNotFoundException("Project not found.");

        var teamRoles = await _teamRoleRepository.GetByUserIdAsync(userId);
        var role = teamRoles.FirstOrDefault(tr => tr.TeamId == project.TeamId)?.Role.ToString();

        if (role != "ProjectManager")
            throw new UnauthorizedAccessException("Only ProjectManager can delete the project.");
        await _projectRepository.DeleteAsync(project);
    }

    public async Task<ProjectInfoDto> GetProjectInfo(Guid projectId)
    {
        var project = await _projectRepository.GetByIdAsync(projectId);
        var tasks = await _taskService.GetTasks(projectId);
        var team = await _teamRepository.GetWithRolesAsync(project.TeamId);
        var users = new List<UserInTeamDto>();
        foreach (var tr in team.TeamRoles)
        {
            var user = await _userRepository.GetByIdAsync(tr.UserId);
            users.Add(new UserInTeamDto
            {
                Id = tr.UserId,
                Username = user.Username,
                Role = tr.Role.ToString(),
            });
        }

        return new ProjectInfoDto
        {
            Id = project.Id,
            Title = project.Title,
            Description = project.Description,
            Tasks = tasks,
            Team = new TeamResponse
            {
                Id = project.TeamId,
                TeamName = team.Title,
                Users = users
            }
        };
    }
}