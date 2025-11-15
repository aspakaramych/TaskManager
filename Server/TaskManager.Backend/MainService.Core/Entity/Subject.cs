namespace MainService.Core.Entity;

public class Subject
{
    public Guid Id { get; set; }
    public string Name { get; set; }
    
    public ICollection<TechTask> TechTasks { get; set; }
}