
using System.ComponentModel.DataAnnotations;

namespace InsurancePolicyPortalDemo.DTOs;

public sealed class AccountInformationRequest : IValidatableObject
{
    [Required]
    [RegularExpression(@"^[A-Za-z0-9_.-]{3,30}$", ErrorMessage = "Username must be 3-30 characters and contain only letters, numbers, dot, underscore, or dash.")]
    public string Username { get; set; } = string.Empty;

    [Required]
    [StringLength(128, MinimumLength = 8)]
    [MinLength(8, ErrorMessage = "Password must contain at least 8 characters.")]
    public string Password { get; set; } = string.Empty;

    [Required]
    [Compare("Password", ErrorMessage = "Password and Confirm Password must match.")]
    public string ConfirmPassword { get; set; } = string.Empty;

    public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
    {
        if (string.IsNullOrEmpty(Password)) yield break;

        if (!Password.Any(char.IsUpper))
            yield return new ValidationResult("Password must contain at least one uppercase letter.", new[] { nameof(Password) });

        if (!Password.Any(char.IsLower))
            yield return new ValidationResult("Password must contain at least one lowercase letter.", new[] { nameof(Password) });

        if (!Password.Any(character => "@#$%!".Contains(character)))
            yield return new ValidationResult("Password must contain at least one special character (@, #, $, %, or !).", new[] { nameof(Password) });

        if (Password.Length < 8)
            yield return new ValidationResult("Password must contain at least 8 characters.", new[] { nameof(Password) });
    }
}
