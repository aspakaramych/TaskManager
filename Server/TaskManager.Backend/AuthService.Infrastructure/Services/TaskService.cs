using AuthService.Core.DTOs;
using AuthService.Core.Entities;
using AuthService.Core.Interfaces;
using Microsoft.Extensions.Logging;

namespace AuthService.Infrastructure.Services;

public class TaskService : ITaskService
{
    private readonly ITaskRepository _taskRepository;
    private readonly IProjectRepository _projectRepository;
    private readonly ITeamRoleRepository _teamRoleRepository;
    private readonly IPickedTaskRepository _pickedTaskRepository;
    private readonly ILogger<TaskService> _logger;

    public TaskService(ITaskRepository taskRepository, IProjectRepository projectRepository,
        ITeamRoleRepository teamRoleRepository, IPickedTaskRepository pickedTaskRepository,
       ILogger<TaskService> logger)
    {
        _taskRepository = taskRepository;
        _projectRepository = projectRepository;
        _teamRoleRepository = teamRoleRepository;
        _pickedTaskRepository = pickedTaskRepository;
        _logger = logger;
    }

    public async Task CreateTask(TaskCreateDto task, Guid projectId, Guid userId)
    {
        
        var project = await _projectRepository.GetByIdAsync(projectId);
        if (project == null)
        {
            _logger.LogError($"Project with id: {projectId} does not exist");
            throw new ArgumentException("Project does not exist");
        }
        var userRole = await _teamRoleRepository.GetByUserAndTeamAsync(userId, project.TeamId); 
        if (userRole == null || userRole.Role != RoleType.ProjectManager) 
        {
            _logger.LogWarning($"User {userId} attempted to create a task but is not the Project Manager for project {projectId}.");
            throw new UnauthorizedAccessException("Only the Project Manager can create tasks for this project.");
        }

        var newTask = new TaskEntity
        {
            Id = Guid.NewGuid(),
            ProjectId = projectId,
            Deadline = task.Deadline,
            Description = task.Description,
            Title = task.Title,
            Progress = TaskProgress.Created,
        };
        await _taskRepository.AddAsync(newTask);
        await _taskRepository.SaveChangesAsync();
    }

    public async Task UpdateTask(TaskUpdateDto task, Guid projectId)
    {
        var project = await _projectRepository.GetByIdAsync(projectId);
        if (project == null)
        {
            _logger.LogError($"Project with id: {projectId} does not exist");
            throw new ArgumentException("Project does not exist");
        }

        var newTask = await _taskRepository.GetByIdAsync(task.Id);
        if (newTask == null)
        {
            _logger.LogError($"Project with id: {projectId} does not exist");
            throw new ArgumentException("Task does not exist");
        }

        newTask.Description = task.Description;
        newTask.Title = task.Title;
        newTask.Deadline = (DateTime)task.Deadline;
        newTask.Progress = (TaskProgress)task.Progress;
        await _taskRepository.UpdateAsync(newTask);
        await _taskRepository.SaveChangesAsync();
    }

    public async Task DeleteTask(Guid taskId)
    {
        var task = await _taskRepository.GetByIdAsync(taskId);
        await _taskRepository.DeleteAsync(task);
        await _taskRepository.SaveChangesAsync();
    }

    public async Task<IEnumerable<TaskResponse>> GetTasks(Guid projectId)
    {
        var rootTasks = await _taskRepository.GetProjectTasksAsTreeAsync(projectId);
        return rootTasks.Select(MapTaskToResponse);
    }

    private TaskResponse MapTaskToResponse(TaskEntity entity)
    {
        var response = new TaskResponse
        {
            Id = entity.Id,
            Deadline = entity.Deadline,
            Description = entity.Description,
            Title = entity.Title,
            Progress = entity.Progress,
            ProjectId = entity.ProjectId,
            TaskHeadId = entity.TaskHeadId,
            Children = entity.Children?
                           .Select(MapTaskToResponse)
                           .ToList()
                       ?? new List<TaskResponse>()
        };

        return response;
    }

    public async Task ConnectTask(Guid projectId, Guid userId, TaskConnect req)
    {
        var project = await _projectRepository.GetByIdAsync(projectId);
        var isPm = await _teamRoleRepository.UserHasRoleInTeamAsync(
            userId,
            project.TeamId,
            RoleType.ProjectManager
        );

        if (!isPm)
        {
            throw new UnauthorizedAccessException($"User {userId} is not authorized to connect tasks in project {projectId}.");
        }
        
        // 2. Проверка самопривязки
        if (req.TaskId == req.HeadTaskId)
        {
            throw new ArgumentException("Cannot connect a task to itself.");
        }

        // 3. Получение и проверка задач
        // Получаем обе задачи для проверки существования и принадлежности к проекту
        var headTask = await _taskRepository.GetByIdAsync(req.HeadTaskId);
        var subTask = await _taskRepository.GetByIdAsync(req.TaskId);

        // Проверка существования
        if (headTask == null)
        {
            throw new ArgumentException($"Head Task with ID {req.HeadTaskId} not found.");
        }
        if (subTask == null)
        {
            throw new ArgumentException($"Sub Task with ID {req.TaskId} not found.");
        }
        
        // Проверка принадлежности к проекту
        if (headTask.ProjectId != projectId || subTask.ProjectId != projectId)
        {
            throw new ArgumentException("Both tasks must belong to the specified project.");
        }
        
        // 4. Обновление: Устанавливаем TaskHeadId и сохраняем сущность
        
        // Если TaskHeadId уже установлен, нет необходимости в запросе к БД
        if (subTask.TaskHeadId == req.HeadTaskId)
        {
            return;
        }

        // **Устанавливаем TaskHeadId**
        subTask.TaskHeadId = req.HeadTaskId;

        // **Вызываем базовый Update**
        await _taskRepository.UpdateAsync(subTask); 
        await _taskRepository.SaveChangesAsync();
    }

    public async Task AssignTask(Guid taskId, Guid userId)
    {
        var pickedTask = new PickedTask
        {
            TaskId = taskId,
            UserId = userId
        };
        await _pickedTaskRepository.AddAsync(pickedTask);
    }
}