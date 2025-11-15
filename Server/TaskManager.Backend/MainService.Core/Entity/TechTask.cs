namespace MainService.Core.Entity;

public class TechTask
{
    public Guid Id { get; set; }
    public string Description { get; set; }
    public DateTime Deadline { get; set; }
    public Guid SubjectId { get; set; } 
    
    public ICollection<Project> Projects { get; set; }
}