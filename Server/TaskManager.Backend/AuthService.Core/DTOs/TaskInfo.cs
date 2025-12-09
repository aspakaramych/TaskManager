namespace AuthService.Core.DTOs;

public class TaskInfo
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public DateTime Deadline { get; set; }
    public string? TaskHeadName { get; set; }
    public IEnumerable<string>? Users { get; set; }
}