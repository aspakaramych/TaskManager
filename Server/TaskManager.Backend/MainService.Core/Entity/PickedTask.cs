namespace MainService.Core.Entity;

public class PickedTask
{
    public Guid UserId { get; set; }
    public Guid TaskId { get; set; }
    
    public User User { get; set; }
    public Task Task { get; set; }
}