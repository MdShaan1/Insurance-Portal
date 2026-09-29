namespace InsurancePolicyPortalDemo.Models;

public class User
{
    public Guid Id { get; set; }

    // Personal Information

    public string PolicyNumber { get; set; } = string.Empty;

    public string FirstName { get; set; } = string.Empty;

    public string LastName { get; set; } = string.Empty;

    public string DateOfBirth { get; set; } = string.Empty;

    public string ZipCode { get; set; } = string.Empty;


    // Account Information

    public string Username { get; set; } = string.Empty;

    public string PasswordHash { get; set; } = string.Empty;


    // Security Information

    public List<SecurityQuestion> SecurityQuestions { get; set; } = new();


    // Contact Information

    public string Email { get; set; } = string.Empty;

    public string Phone { get; set; } = string.Empty;

    public string StreetAddress { get; set; } = string.Empty;

    public string StreetAddressLine2 { get; set; } = string.Empty;

    public string City { get; set; } = string.Empty;

    public string State { get; set; } = string.Empty;

    public string Country { get; set; } = string.Empty;


    // System Information

    public DateTime CreatedAt { get; set; }
}