using AuthService.Core.Entity;

namespace AuthService.Core.Entities;

public class User
{
    public Guid Id { get; set; }
    public string Username { get; set; }
    public string Email { get; set; }
    public string Password { get; set; }
    public string FirstName { get; set; }
    public string LastName { get; set; }
    
    public UserRole Role { get; set; } = UserRole.Student;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    public ICollection<RefreshToken> RefreshTokens { get; set; }
    public ICollection<TeamRole> TeamRoles { get; set; }
    public ICollection<PickedTask> PickedTasks { get; set; }
}

public enum UserRole
{
    Teacher,
    Student
}