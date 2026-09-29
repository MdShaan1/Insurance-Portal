namespace InsurancePolicyPortalDemo.Entities;

public class PolicyHolderEntity
{
    public int Id { get; set; }

    public string SSN { get; set; } = string.Empty;

    public string PolicyNumber { get; set; } = string.Empty;

    public string FirstName { get; set; } = string.Empty;

    public string LastName { get; set; } = string.Empty;

    public string DateOfBirth { get; set; } = string.Empty;

    public string ZipCode { get; set; } = string.Empty;

    public string Email { get; set; } = string.Empty;

    public string Phone { get; set; } = string.Empty;
}