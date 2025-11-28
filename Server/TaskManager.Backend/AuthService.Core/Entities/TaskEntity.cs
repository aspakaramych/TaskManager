using AuthService.Core.Entities;

namespace AuthService.Core.Entities;

public class TaskEntity
{
    public Guid Id { get; set; }
    public string Title { get; set; }
    public string Description { get; set; }
    public DateTime Deadline { get; set; }
    public TaskProgress Progress { get; set; }
    public Guid ProjectId { get; set; }
    public Guid? TaskHeadId { get; set; }
    public Project Project { get; set; }
    public TaskEntity TaskEntityHead { get; set; }
    
    public ICollection<TaskEntity> Children { get; set; }
    
}

public enum TaskProgress
{
    Done,
    Canceled,
    Taken,
    Created,
}