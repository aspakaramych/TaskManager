using System.ComponentModel.DataAnnotations;

namespace AuthService.Core.DTOs;

public class TechTaskUpdateDto
{
    [Required]
    public Guid Id { get; set; } 

    public string? Description { get; set; } 
    
    public DateTime? Deadline { get; set; }
}