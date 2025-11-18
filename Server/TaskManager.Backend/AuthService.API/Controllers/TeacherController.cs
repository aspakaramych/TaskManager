using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using AuthService.Core.DTOs;
using AuthService.Core.Interfaces;
using AuthService.Core.DTOs;
using MainService.Core.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AuthService.API.Controllers;

[ApiController]
[Route("/api/teacher")]
public class TeacherController : ControllerBase
{
    private readonly ISubjectService _subjectService;

    public TeacherController(ISubjectService subjectService)
    {
        _subjectService = subjectService;
    }

    [HttpPost("add_subject")]
    [Authorize(Roles = "Teacher")]
    public async Task<IActionResult> CreateSubject([FromBody] SubjectRequest request)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier) ??
                          User.FindFirst(JwtRegisteredClaimNames.Sub);
        if (userIdClaim == null || !Guid.TryParse(userIdClaim.Value, out var reqUserId))
        {
            return Unauthorized();
        }
        var response = await _subjectService.CreateSubject(request, reqUserId);
        return StatusCode(201, response);
    }
}