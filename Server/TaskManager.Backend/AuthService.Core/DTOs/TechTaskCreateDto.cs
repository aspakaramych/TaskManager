using System.ComponentModel.DataAnnotations;

namespace AuthService.Core.DTOs;

public class TechTaskCreateDto
{
    [Required(ErrorMessage = "Описание технического задания обязательно")]
    public string Description { get; set; }

    [Required(ErrorMessage = "Срок сдачи обязателен")]
    public DateTime Deadline { get; set; }
}