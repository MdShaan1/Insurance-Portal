
using System.ComponentModel.DataAnnotations;

namespace InsurancePolicyPortalDemo.DTOs;

public sealed class ContactInformationRequest : IValidatableObject
{
    [Required]
    [EmailAddress]
    [StringLength(254)]
    public string Email { get; set; } = string.Empty;

    [Required]
    [RegularExpression(@"^\d{10}$", ErrorMessage = "Phone number must contain exactly 10 digits.")]
    public string Phone { get; set; } = string.Empty;

    [Required]
    [MinLength(5, ErrorMessage = "Street address is required.")]
    [StringLength(200)]
    public string StreetAddress { get; set; } = string.Empty;

    [StringLength(100)]
    public string StreetAddressLine2 { get; set; } = string.Empty;

    [Required]
    [RegularExpression(@"^[A-Za-z .'-]{2,60}$", ErrorMessage = "City must contain only letters and common separators.")]
    [StringLength(60)]
    public string City { get; set; } = string.Empty;

    [Required]
    [RegularExpression(@"^[A-Za-z .'-]{2,60}$", ErrorMessage = "State must contain only letters and common separators.")]
    [StringLength(60)]
    public string State { get; set; } = string.Empty;

    [Required]
    [RegularExpression(@"^\d{5,6}$", ErrorMessage = "ZIP code must contain 5 or 6 digits.")]
    public string ZipCode { get; set; } = string.Empty;

    [Required]
    [RegularExpression(@"^[A-Za-z .'-]{2,60}$", ErrorMessage = "Country must contain only letters and common separators.")]
    [StringLength(60)]
    public string Country { get; set; } = string.Empty;

    public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
    {
        if (string.IsNullOrWhiteSpace(StreetAddress))
            yield return new ValidationResult("Street address is required.", new[] { nameof(StreetAddress) });
    }
}
