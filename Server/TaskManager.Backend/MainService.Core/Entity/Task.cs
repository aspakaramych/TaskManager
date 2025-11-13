namespace MainService.Core.Entity;

public class Task
{
    public Guid Id { get; set; }
    public string Title { get; set; }
    public string Description { get; set; }
    public DateTime Deadline { get; set; }
    public TaskProgress Progress { get; set; }
    public Guid ProjectId { get; set; }
    public Guid TaskHeadId { get; set; }
    public Project Project { get; set; }
    public Task TaskHead { get; set; }
    
    public ICollection<Task> Children { get; set; }
    
}

public enum TaskProgress
{
    Done,
    Canceled,
    Taken,
    Created,
}