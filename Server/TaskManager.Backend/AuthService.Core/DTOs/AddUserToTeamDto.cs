namespace AuthService.Core.DTOs;

public class AddUserToTeamDto
{
    public Guid UserId { get; set; }
    public Guid TeamId { get; set; }
    public string Role { get; set; }
}