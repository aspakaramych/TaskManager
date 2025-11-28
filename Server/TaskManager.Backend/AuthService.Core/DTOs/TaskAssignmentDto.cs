using System.ComponentModel.DataAnnotations;

namespace AuthService.Core.DTOs;

public class TaskAssignmentDto
{
    [Required]
    public Guid TaskId { get; set; }

    [Required]
    public Guid AssigneeId { get; set; }
}