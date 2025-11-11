using System.ComponentModel.DataAnnotations;

namespace AuthService.Core.DTOs;

public class RegisterRequest
{
    [Required(ErrorMessage = "Username is required")]
    [MinLength(3, ErrorMessage = "Username must be at least 3 characters")]
    [MaxLength(50, ErrorMessage = "Username cannot exceed 50 characters")]
    [RegularExpression(@"^[a-zA-Z0-9_]+$", ErrorMessage = "Username can only contain letters, numbers and underscores")]
    public string Username { get; set; }
    
    [Required(ErrorMessage = "Email is required")]
    [EmailAddress(ErrorMessage = "Invalid email format")]
    public string Email { get; set; }

    [Required(ErrorMessage = "Password is required")]
    [MinLength(8, ErrorMessage = "Password must be at least 8 characters")]
    [RegularExpression(@"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\da-zA-Z]).{8,}$", 
        ErrorMessage = "Password must contain at least one uppercase letter, one lowercase letter, one number and one special character")]
    public string Password { get; set; }

    [Required(ErrorMessage = "First name is required")]
    [MaxLength(50, ErrorMessage = "First name cannot exceed 50 characters")]
    public string FirstName { get; set; }

    [Required(ErrorMessage = "Last name is required")]
    [MaxLength(50, ErrorMessage = "Last name cannot exceed 50 characters")]
    public string LastName { get; set; }
}