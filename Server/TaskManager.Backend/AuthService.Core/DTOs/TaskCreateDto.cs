using System.ComponentModel.DataAnnotations;

namespace AuthService.Core.DTOs;

public class TaskCreateDto
{
    [Required]
    [StringLength(200, MinimumLength = 1)]
    public string Title { get; set; } = string.Empty;

    [MaxLength(2000)]
    public string Description { get; set; }

    [Required]
    public DateTime Deadline { get; set; }
    
    public Guid? HeadTaskId { get; set; }
}