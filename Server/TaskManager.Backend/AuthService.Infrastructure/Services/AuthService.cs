using AuthService.Core.DTOs;
using AuthService.Core.Entities;
using AuthService.Core.Interfaces;
using Microsoft.Extensions.Logging;

namespace AuthService.Infrastructure.Services;

public class AuthService : IAuthService
{
    private readonly IUserRepository _userRepository;
    private readonly IRefreshTokenRepository _refreshTokenRepository;
    private readonly ITokenService _tokenService;
    private readonly IPasswordHasher _passwordHasher;
    private readonly ILogger<AuthService> _logger;

    public AuthService(IUserRepository userRepository, IRefreshTokenRepository refreshTokenRepository, ITokenService tokenService, IPasswordHasher passwordHasher, ILogger<AuthService> logger)
    {
        _userRepository = userRepository;
        _refreshTokenRepository = refreshTokenRepository;
        _tokenService = tokenService;
        _passwordHasher = passwordHasher;
        _logger = logger;
    }
    
    public async Task<AuthResponse> RegisterAsync(RegisterRequest request)
    {
        if (await _userRepository.ExistsByEmailAsync(request.Email))
        {
            throw new ArgumentException($"Email {request.Email} already exists");
        }

        if (await _userRepository.ExistsByUsernameAsync(request.Username))
        {
            throw new ArgumentException($"Username {request.Username} already exists");
        }

        var user = new User
        {
            Id = Guid.NewGuid(),
            Username = request.Username,
            Email = request.Email,
            Password = _passwordHasher.HashPassword(request.Password),
            FirstName = request.FirstName,
            LastName = request.LastName,
            CreatedAt = DateTime.UtcNow,
        };
        
        await _userRepository.AddAsync(user);
        var accessToken = _tokenService.GenerateAccessToken(user);
        var refreshToken = _tokenService.GenerateRefreshToken(user.Id);
        await _refreshTokenRepository.AddAsync(refreshToken);

        return new AuthResponse
        {
            AccessToken = accessToken,
            RefreshToken = refreshToken.Token.ToString(),
            User = new UserDto
            {
                Username = user.Username,
                Email = user.Email,
                FirstName = user.FirstName,
                LastName = user.LastName,
            }
        };

    }

    public async Task<AuthResponse> LoginAsync(LoginRequest request)
    {
        var user = await _userRepository.GetByEmailAsync(request.Email);
        _logger.LogInformation(request.Email);
        _logger.LogInformation(request.Password);
        _logger.LogInformation(user.Id.ToString());
        _logger.LogInformation(_passwordHasher.VerifyPassword(request.Password, user.Password).ToString());
        if (user == null || !_passwordHasher.VerifyPassword(request.Password, user.Password))
        {
            throw new UnauthorizedAccessException("Invalid email or password");
        }
        var accessToken = _tokenService.GenerateAccessToken(user);
        var refreshToken = _tokenService.GenerateRefreshToken(user.Id);
        
        await _refreshTokenRepository.DeleteExpiredAsync();
        await _refreshTokenRepository.AddAsync(refreshToken);

        return new AuthResponse
        {
            AccessToken = accessToken,
            RefreshToken = refreshToken.Token.ToString(),
            User = new UserDto
            {
                Username = user.Username,
                Email = user.Email,
                FirstName = user.FirstName,
                LastName = user.LastName,
            }
        };
    }

    public async Task<AuthResponse> RefreshTokenAsync(RefreshTokenRequest request)
    {
        if (!Guid.TryParse(request.RefreshToken, out var refreshTokenGuid))
        {
            throw new ArgumentException("Invalid refresh token");
        }

        var storedToken = await _refreshTokenRepository.GetRefreshToken(refreshTokenGuid);

        if (storedToken == null || storedToken.Expires < DateTime.UtcNow)
        {
            throw new UnauthorizedAccessException("Invalid refresh token");
        }
        
        var user = await _userRepository.GetByIdAsync(storedToken.UserId);
        if (user == null)
        {
            throw new UnauthorizedAccessException("User Not Found");
        }
        var newAccessToken = _tokenService.GenerateAccessToken(user);
        var newRefreshToken = _tokenService.GenerateRefreshToken(user.Id);

        await _refreshTokenRepository.DeleteAsync(storedToken);
        await _refreshTokenRepository.AddAsync(newRefreshToken);

        return new AuthResponse
        {
            AccessToken = newAccessToken,
            RefreshToken = newRefreshToken.Token.ToString(),
            User = new UserDto
            {
                Username = user.Username,
                Email = user.Email,
                FirstName = user.FirstName,
                LastName = user.LastName,
            }
        };
    }

    public async Task RevokeRefreshTokenAsync(RefreshTokenRequest request)
    {
        if (!Guid.TryParse(request.RefreshToken, out var refreshTokenGuid))
        {
            throw new ArgumentException("Invalid refresh token");
        }
        var storedToken = await _refreshTokenRepository.GetRefreshToken(refreshTokenGuid);
        if (storedToken != null)
        {
            await _refreshTokenRepository.DeleteAsync(storedToken);
        }
    }
}