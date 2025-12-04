namespace AuthService.Core.Interfaces;

public interface ITeamService
{
    Task AddUserToTeam(Guid teamId, Guid userId, Guid projectManagerId, string role);
    
}