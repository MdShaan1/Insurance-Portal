using System.ComponentModel.DataAnnotations;
using System.Globalization;

namespace InsurancePolicyPortalDemo.DTOs;

public sealed class PersonalInformationRequest : IValidatableObject
{
    [Required]
    [RegularExpression(@"^\d{4}$", ErrorMessage = "SSN must contain exactly 4 digits.")]
    public string SSN { get; set; } = string.Empty;

    [Required]
    [StringLength(12, MinimumLength = 9)]
    [RegularExpression(@"^VA[A-Za-z0-9]{7,10}$", ErrorMessage = "Policy number must start with VA and contain 9-12 characters total.")]
    public string PolicyNumber { get; set; } = string.Empty;

    [Required]
    [StringLength(50, MinimumLength = 1)]
    [RegularExpression(@"^[A-Za-z][A-Za-z'\- ]{0,49}$", ErrorMessage = "First name must be 1-50 letters with valid characters.")]
    public string FirstName { get; set; } = string.Empty;

    [Required]
    [StringLength(50, MinimumLength = 1)]
    [RegularExpression(@"^[A-Za-z][A-Za-z'\- ]{0,49}$", ErrorMessage = "Last name must be 1-50 letters with valid characters.")]
    public string LastName { get; set; } = string.Empty;

    [Required]
    [RegularExpression(@"^(0[1-9]|1[0-2])/(0[1-9]|[12]\d|3[01])/(\d{4})$", ErrorMessage = "Date of birth must be in MM/DD/YYYY format.")]
    public string DateOfBirth { get; set; } = string.Empty;

    [Required]
    [RegularExpression(@"^\d{5,6}$", ErrorMessage = "ZIP code must contain 5 or 6 digits.")]
    public string ZipCode { get; set; } = string.Empty;

    public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
    {
        if (DateTime.TryParseExact(
                DateOfBirth,
                "MM/dd/yyyy",
                CultureInfo.InvariantCulture,
                DateTimeStyles.None,
                out var parsedDate))
        {
            if (parsedDate.Date > DateTime.UtcNow.Date)
            {
                yield return new ValidationResult("Date of birth cannot be in the future.", new[] { nameof(DateOfBirth) });
            }
        }
        else
        {
            yield return new ValidationResult("Date of birth must be a valid date in MM/DD/YYYY format.", new[] { nameof(DateOfBirth) });
        }
    }
}