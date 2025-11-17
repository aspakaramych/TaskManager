using AuthService.Core.Entities;

namespace AuthService.Core.Entity;

public class Project
{
    public Guid Id { get; set; }
    public string Title { get; set; }
    public string Description { get; set; }
    public Guid TeamId { get; set; }
    public Guid ProjectManagerId { get; set; }
    
    public Team Team { get; set; }
    public User ProjectManager { get; set; }
    
    public ICollection<TaskEntity> Tasks { get; set; }
}