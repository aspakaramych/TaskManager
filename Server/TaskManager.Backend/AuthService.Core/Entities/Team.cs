using AuthService.Core.Entities;

namespace AuthService.Core.Entities;

public class Team
{
    public Guid Id { get; set; }
    public string Title { get; set; }
    public string Description { get; set; }
    public Guid ProjectId { get; set; }
    
    public ICollection<TeamRole> TeamRoles { get; set; }
    public Project Project { get; set; }
}