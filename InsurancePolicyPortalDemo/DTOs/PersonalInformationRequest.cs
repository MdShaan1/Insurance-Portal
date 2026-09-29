using System.ComponentModel.DataAnnotations;

namespace InsurancePolicyPortalDemo.DTOs;

public class PersonalInformationRequest
{
    [Required]
    [RegularExpression(@"^\d{4}$",
        ErrorMessage = "SSN must contain exactly 4 digits.")]
    public string SSN { get; set; } = string.Empty;

    [Required]
    public string PolicyNumber { get; set; } = string.Empty;

    [Required]
    public string FirstName { get; set; } = string.Empty;

    [Required]
    public string LastName { get; set; } = string.Empty;

    [Required]
    public string DateOfBirth { get; set; } = string.Empty;

    [Required]
    public string ZipCode { get; set; } = string.Empty;
}