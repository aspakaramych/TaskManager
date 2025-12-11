using AuthService.Core.DTOs;
using AuthService.Core.Entities;
using AuthService.Core.Interfaces;

namespace AuthService.Infrastructure.Services;

public class TeamService : ITeamService
{
    private readonly ITeamRepository _teamRepository;
    private readonly IUserRepository _userRepository;
    private readonly ITeamRoleRepository _teamRoleRepository;

    public TeamService(ITeamRepository teamRepository, IUserRepository userRepository, ITeamRoleRepository teamRoleRepository)
    {
        _teamRepository = teamRepository;
        _userRepository = userRepository;
        _teamRoleRepository = teamRoleRepository;
    }

    public async Task AddUserToTeam(Guid teamId, Guid userId, Guid projectManagerId, string role)
    {
        // 1. Проверка существования команды (проекта)
        // Предполагаем, что в ITeamRepository есть метод GetByIdAsync
        var team = await _teamRepository.GetByIdAsync(teamId);
        if (team == null)
        {
            throw new ArgumentException($"Team with ID {teamId} not found.");
        }

        // 2. Проверка существования Project Manager
        var projectManager = await _userRepository.GetByIdAsync(projectManagerId);
        if (projectManager == null)
        {
            throw new ArgumentException($"User (Project Manager) with ID {projectManagerId} not found.");
        }

        // 3. **Главная проверка: Является ли projectManagerId Project Manager'ом в этой команде?**
        var isPm = await _teamRoleRepository.UserHasRoleInTeamAsync(
            projectManagerId,
            teamId,
            RoleType.ProjectManager // Предполагаем, что это правильное имя роли для ПМ
        );

        if (!isPm)
        {
            // Используйте реальный класс исключения вашего приложения
            throw new ArgumentException($"User {projectManagerId} is not authorized to add users to team {teamId} (not a Project Manager).");
        }

        // 4. Проверка существования добавляемого пользователя
        var userToAdd = await _userRepository.GetByIdAsync(userId);
        if (userToAdd == null)
        {
            throw new ArgumentException($"User with ID {userId} not found.");
        }

        // 5. Проверка, не состоит ли пользователь уже в команде
        var existingRole = await _teamRoleRepository.GetByUserAndTeamAsync(userId, teamId);
        if (existingRole != null)
        {
            throw new InvalidOperationException($"User {userId} is already a member of team {teamId} with role {existingRole.Role}.");
        }

        // 6. Преобразование строковой роли в enum
        if (!Enum.TryParse(role, true, out RoleType roleType))
        {
            throw new InvalidOperationException($"Invalid role specified: '{role}'. Available roles: {string.Join(", ", Enum.GetNames(typeof(RoleType)))}.");
        }

        // 7. Добавление пользователя в команду
        var newTeamRole = new TeamRole
        {
            TeamId = teamId,
            UserId = userId,
            Role = roleType,
        };

        await _teamRoleRepository.AddAsync(newTeamRole);
        await _teamRoleRepository.SaveChangesAsync(); // Сохраняем изменения в TeamRoleRepository
    }

    public async Task<IEnumerable<UserResponse>> GetAllUsers()
    {
        var users = await _userRepository.GetAllAsync();
        return users.Select(u => new UserResponse
        {
            Id = u.Id,
            Username = u.Username,
        });
    }
}