using System.ComponentModel.DataAnnotations;

namespace AuthService.Core.DTOs;

public class SubjectRequest
{
    [Required]
    [MinLength(1)]
    public string Name { get; set; }
}