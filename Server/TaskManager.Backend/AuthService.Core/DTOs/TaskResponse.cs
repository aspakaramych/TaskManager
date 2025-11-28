using AuthService.Core.Entities;

namespace AuthService.Core.DTOs;

public class TaskResponse
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public DateTime Deadline { get; set; }
    public TaskProgress Progress { get; set; }
    public Guid ProjectId { get; set; }
    public Guid? TaskHeadId { get; set; }
    public Guid? AssigneeId { get; set; }
    public string? AssigneeName { get; set; }
    public ICollection<TaskResponse> Children { get; set; } = new List<TaskResponse>();
}