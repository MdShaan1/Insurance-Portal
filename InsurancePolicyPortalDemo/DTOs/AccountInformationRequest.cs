using System.ComponentModel.DataAnnotations;

namespace InsurancePolicyPortalDemo.DTOs;

public class AccountInformationRequest : IValidatableObject
{
    [Required]
    public string Username { get; set; } = string.Empty;

    [Required]
    [MinLength(8, ErrorMessage = "Password must contain at least 8 characters.")]
    public string Password { get; set; } = string.Empty;

    [Required]
    [Compare("Password", ErrorMessage = "Password and Confirm Password must match.")]
    public string ConfirmPassword { get; set; } = string.Empty;


    public IEnumerable<ValidationResult> Validate(
        ValidationContext validationContext)
    {
        if (string.IsNullOrEmpty(Password))
        {
            yield break;
        }

        if (!Password.Any(char.IsUpper))
        {
            yield return new ValidationResult(
                "Password must contain at least one uppercase letter.",
                new[] { nameof(Password) }
            );
        }

        if (!Password.Any(char.IsLower))
        {
            yield return new ValidationResult(
                "Password must contain at least one lowercase letter.",
                new[] { nameof(Password) }
            );
        }

        if (!Password.Any(
            character => "@#$%!".Contains(character)))
        {
            yield return new ValidationResult(
                "Password must contain at least one special character (@, #, $, %, or !).",
                new[] { nameof(Password) }
            );
        }
    }
}