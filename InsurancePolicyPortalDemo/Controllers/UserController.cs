using System.Security.Claims;
using InsurancePolicyPortalDemo.DTOs;
using InsurancePolicyPortalDemo.Services;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;

namespace InsurancePolicyPortalDemo.Controllers;

[ApiController]
[Route("api/users")]
public sealed class UserController(
    IUserService userService,
    IOptions<SecurityQuestionOptions> securityQuestionOptions) : ControllerBase
{
    [HttpGet("security-questions")]
    [ProducesResponseType(typeof(IReadOnlyDictionary<string, string>), StatusCodes.Status200OK)]
    public IActionResult GetSecurityQuestions()
    {
        var options = securityQuestionOptions.Value;
        return Ok(new Dictionary<string, string>
        {
            ["petName"] = options.PetName,
            ["childhoodFriendName"] = options.ChildhoodFriendName
        });
    }

    [HttpPost("verify-policyholder")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status409Conflict)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status422UnprocessableEntity)]
    public async Task<IActionResult> VerifyPolicyHolder(
        [FromBody] PersonalInformationRequest request,
        CancellationToken cancellationToken)
    {
        if (!await userService.VerifyPolicyHolderAsync(request, cancellationToken))
        {
            throw new PolicyholderValidationException("personalInformation");
        }

        return Ok(new { message = "Policyholder verified successfully. You can continue registration." });
    }

    [HttpPost("register")]
    [ProducesResponseType(typeof(UserResponse), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status409Conflict)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status422UnprocessableEntity)]
    public async Task<IActionResult> Register(
        [FromBody] RegistrationRequest request,
        CancellationToken cancellationToken)
    {
        var user = await userService.RegisterAsync(request, cancellationToken);
        return CreatedAtAction(nameof(GetById), new { id = user.Id }, user);
    }

    [HttpPost("login")]
    [ProducesResponseType(typeof(UserResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> Login(
        [FromBody] UserLoginRequest request,
        CancellationToken cancellationToken)
    {
        var user = await userService.LoginAsync(request, cancellationToken);
        if (user is null)
        {
            return Unauthorized(new ProblemDetails
            {
                Title = "Authentication failed",
                Detail = "Invalid username or password.",
                Status = StatusCodes.Status401Unauthorized,
                Instance = HttpContext.Request.Path
            });
        }

        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Name, user.Username),
            new Claim("policyNumber", user.PolicyNumber)
        };
        var principal = new ClaimsPrincipal(new ClaimsIdentity(
            claims,
            CookieAuthenticationDefaults.AuthenticationScheme));

        await HttpContext.SignInAsync(
            CookieAuthenticationDefaults.AuthenticationScheme,
            principal,
            new AuthenticationProperties
            {
                IsPersistent = false,
                AllowRefresh = true,
                ExpiresUtc = DateTimeOffset.UtcNow.AddHours(2)
            });

        return Ok(user);
    }

    [Authorize]
    [HttpPost("logout")]
    public async Task<IActionResult> Logout()
    {
        await HttpContext.SignOutAsync(CookieAuthenticationDefaults.AuthenticationScheme);
        return NoContent();
    }

    [Authorize]
    [HttpGet("me")]
    public IActionResult GetCurrentUser() => Ok(new
    {
        userId = User.FindFirstValue(ClaimTypes.NameIdentifier),
        username = User.FindFirstValue(ClaimTypes.Name),
        policyNumber = User.FindFirstValue("policyNumber")
    });

    [Authorize]
    [HttpGet("{id:guid}", Name = nameof(GetById))]
    [ProducesResponseType(typeof(UserResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetById(Guid id, CancellationToken cancellationToken)
    {
        if (!Guid.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out var currentUserId)
            || currentUserId != id)
        {
            return NotFound();
        }

        var user = await userService.GetByIdAsync(id, cancellationToken);
        return user is null ? NotFound() : Ok(user);
    }
}
