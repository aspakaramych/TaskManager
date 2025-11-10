namespace AuthService.Core.Entities;

public class RefreshToken
{
    public Guid Token { get; set; } 
    public DateTime Expires { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public Guid UserId { get; set; }
    public User User { get; set; }
}