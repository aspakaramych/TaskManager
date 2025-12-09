namespace AuthService.Core.Entities;

public class PickedTask
{
    public Guid UserId { get; set; }
    public Guid TaskId { get; set; }
    
    public User User { get; set; }
    public TaskEntity Task { get; set; }
}