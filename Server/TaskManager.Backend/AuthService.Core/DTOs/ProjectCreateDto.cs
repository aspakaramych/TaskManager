using System;
using System.ComponentModel.DataAnnotations;

namespace AuthService.Core.DTOs;

public class ProjectCreateDto
{
    [Required(ErrorMessage = "Название проекта обязательно")]
    [StringLength(200, MinimumLength = 1)]
    public string Title { get; set; } = string.Empty;

    [MaxLength(2000)]
    public string? Description { get; set; }
}

