using AuthService.Core.Entities;

namespace AuthService.Core.Entity;

public class TeamRole
{
    public Guid UserId { get; set; }
    public Guid TeamId { get; set; }
    public RoleType Role { get; set; }
    
    public User User { get; set; }
    public Team Team { get; set; }
}

public enum RoleType
{
    ProjectManager,
    Backend,
    Frontend,
    Designer,
    Mobile
}