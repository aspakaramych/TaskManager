namespace AuthService.Core.DTOs;

public class ProjectInfoDto
{
    public Guid Id { get; set; }
    public string Title { get; set; }
    public string Description { get; set; }
    
    public IEnumerable<TaskResponse> Tasks { get; set; }
    public TeamResponse Team { get; set; }
}