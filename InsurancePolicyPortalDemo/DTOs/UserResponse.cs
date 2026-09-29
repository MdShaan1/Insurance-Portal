namespace InsurancePolicyPortalDemo.DTOs;

public class UserResponse
{
    public Guid Id { get; set; }

    public string PolicyNumber { get; set; } = string.Empty;

    public string FirstName { get; set; } = string.Empty;

    public string LastName { get; set; } = string.Empty;

    public string Username { get; set; } = string.Empty;

    public string Email { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; }
}