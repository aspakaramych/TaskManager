using System;
using System.ComponentModel.DataAnnotations;

namespace AuthService.Core.DTOs;

public class ProjectUpdateDto
{
    [StringLength(200, MinimumLength = 1)]
    public string? Title { get; set; }

    [MaxLength(2000)]
    public string? Description { get; set; }
}

