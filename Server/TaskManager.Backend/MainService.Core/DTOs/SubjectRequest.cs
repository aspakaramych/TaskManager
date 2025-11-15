using System.ComponentModel.DataAnnotations;

namespace MainService.Core.DTOs;

public class SubjectRequest
{
    [Required]
    [MinLength(1)]
    public string Name { get; set; }
}