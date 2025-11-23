using System;
using System.ComponentModel.DataAnnotations;

namespace AuthService.Core.DTOs;

public class ProjectGetDto
{
    public Guid Id { get; set; }
    public string Title { get; set; }
    public string Description { get; set; }
    public string Role { get; set; } 
    public Guid TeamId { get; set; } 
}
