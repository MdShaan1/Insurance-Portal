using System.ComponentModel.DataAnnotations;
namespace InsurancePolicyPortalDemo.DTOs;
public class UserLoginRequest
{
    [Required]
    public string Username { get; set; } = string.Empty;
    [Required]
    public string Password { get; set; } = string.Empty;
}