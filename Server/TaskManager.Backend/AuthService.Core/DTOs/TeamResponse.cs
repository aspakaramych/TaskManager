namespace AuthService.Core.DTOs;

public class TeamResponse
{
    public Guid Id { get; set; }
    public string TeamName { get; set; }
    public IEnumerable<UserInTeamDto> Users { get; set; }
}