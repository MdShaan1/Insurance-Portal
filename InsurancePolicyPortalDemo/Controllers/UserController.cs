using InsurancePolicyPortalDemo.DTOs;
using InsurancePolicyPortalDemo.Services;
using Microsoft.AspNetCore.Mvc;

namespace InsurancePolicyPortalDemo.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UserController : ControllerBase
{
        private readonly IUserService _userService;
    public UserController(IUserService userService)
    {
        _userService = userService;
    }
    [HttpPost("verify-policyholder")]
    public async Task<IActionResult> VerifyPolicyHolder(
        [FromBody] PersonalInformationRequest request)
    {
        var isValid =
            await _userService.VerifyPolicyHolderAsync(
                request
            );
        if (!isValid)
        {
            return BadRequest(new
            {
                message =
                    "Policyholder details could not be verified."
            });
        }
        return Ok(new
        {
            message =
                "Policyholder verified successfully. You can continue registration."
        });
    }
    [HttpPost("SignUp")]
    public async Task<IActionResult> Register(
        [FromBody] RegistrationRequest request)
    {
        try
        {
            var user =
                   await _userService.RegisterAsync(
                    request.PersonalInformation,
                    request.AccountInformation,
                    request.SecurityInformation,
                    request.ContactInformation
                );
            return Ok(user);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new
            {
                message = ex.Message
            });
        }
    }
    [HttpPost("login")]
    public async Task<IActionResult> Login(
        [FromBody] UserLoginRequest request)
    {
        var user =
            await _userService.LoginAsync(request);
        if (user == null)
        {
            return Unauthorized(new
            {
                message =
                    "Invalid username or password."
            });
        }
        return Ok(user);
    }
}