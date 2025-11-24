using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using AuthService.Core.DTOs;
using AuthService.Core.Entities;
using AuthService.Core.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AuthService.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class MainController : ControllerBase
{
    private readonly ISubjectService _subjectService;
    private readonly IProjectService _projectService;
    private readonly ITechService _techService;
    private readonly ILogger<MainController> _logger;

    public MainController(ISubjectService subjectService, ILogger<MainController> logger, IProjectService projectService, ITechService techService)
    {
        _subjectService = subjectService;
        _projectService = projectService;
        _techService = techService;
        _logger = logger;
    }
    
    [HttpGet]
    [Authorize]
    public async Task<IActionResult> LoadMainScreen()
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
        var userRoleClaim = User.FindFirst(ClaimTypes.Role);
        
        if (userRoleClaim == null)
        {
            return Unauthorized();
        }

        if (userRoleClaim.Value == nameof(UserRole.Student))
        {
            var response =  await _projectService.GetProjects(reqUserId);
            return Ok(response);
        }
        else
        {
            var response =  await _subjectService.GetSubjects(reqUserId);
            return Ok(response);
        }
    }
    
    [HttpPost("subjects")]
    [Authorize(Roles = nameof(UserRole.Teacher))]
    public async Task<IActionResult> CreateSubject([FromBody] SubjectRequest subjectRequest)
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

        var response = await _subjectService.CreateSubject(subjectRequest, reqUserId);
        return CreatedAtAction(nameof(CreateSubject), new { id = response.Id }, response);
    }
    
    [HttpPost("projects")]
    public async Task<IActionResult> CreateProject([FromBody] ProjectCreateDto projectCreateDto)
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

        await _projectService.CreateProject(projectCreateDto, reqUserId);
        return CreatedAtAction(nameof(CreateProject), null);
    }

    [HttpGet("{subjectId}/techtasks")]
    public async Task<IActionResult> GetTechTaskBySubject(Guid subjectId)
    {
        var response = await _techService.GetTechTasksBySubjectIdAsync(subjectId);
        return Ok(response);
    }

    [HttpGet("techtasks")]
    public async Task<IActionResult> GetTechTask()
    {
        var response = await _techService.GetTechTasksAsync();
        return Ok(response);
    }


    [HttpPost("{subjectId}/techtasks")]
    [Authorize(Roles = nameof(UserRole.Teacher))]
    public async Task<IActionResult> CreateTechTask(Guid subjectId, [FromBody] TechTaskCreateDto techTaskRequest)
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

        var response = await _techService.CreateTechTaskAsync(techTaskRequest, reqUserId, subjectId);
        return CreatedAtAction(nameof(CreateTechTask), new { id = response.Id }, response);
    }
}