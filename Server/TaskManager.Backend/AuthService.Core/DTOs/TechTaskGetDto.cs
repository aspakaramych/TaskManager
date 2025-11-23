namespace AuthService.Core.DTOs;

public class TechTaskGetDto
{
    public Guid Id { get; set; }
    public string Description { get; set; }
    public DateTime Deadline { get; set; }
    public Guid SubjectId { get; set; }
}