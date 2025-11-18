
namespace AuthService.Core.Entities;

public class Subject
{
    public Guid Id { get; set; }
    public string Name { get; set; }
    
    public Guid TeacherId { get; set; }
    
    public User Teacher { get; set; }
    
    public ICollection<TechTask> TechTasks { get; set; }
}