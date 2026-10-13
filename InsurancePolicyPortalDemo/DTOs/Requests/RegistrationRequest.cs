using System.ComponentModel.DataAnnotations;

namespace InsurancePolicyPortalDemo.DTOs;

public sealed class RegistrationRequest
{
    [Required]
    public PersonalInformationRequest PersonalInformation { get; set; } = new();

    [Required]
    public AccountInformationRequest AccountInformation { get; set; } = new();

    [Required]
    public SecurityInformationRequest SecurityInformation { get; set; } = new();

    [Required]
    public ContactInformationRequest ContactInformation { get; set; } = new();
}