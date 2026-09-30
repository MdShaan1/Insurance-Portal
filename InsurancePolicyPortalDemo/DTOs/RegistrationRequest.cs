namespace InsurancePolicyPortalDemo.DTOs;

public class RegistrationRequest
{
    public PersonalInformationRequest PersonalInformation { get; set; } = new();
    public AccountInformationRequest AccountInformation { get; set; } = new();
    public SecurityInformationRequest SecurityInformation { get; set; } = new();
    public ContactInformationRequest ContactInformation { get; set; } = new();
}