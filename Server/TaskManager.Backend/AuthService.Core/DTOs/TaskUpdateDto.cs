using System.ComponentModel.DataAnnotations;
using AuthService.Core.Entities;

namespace AuthService.Core.DTOs;

public class TaskUpdateDto
{
    [StringLength(200, MinimumLength = 1)]
    public string? Title { get; set; }

    [MaxLength(2000)]
    public string? Description { get; set; }

    public DateTime? Deadline { get; set; }

    public string? Progress { get; set; }
}