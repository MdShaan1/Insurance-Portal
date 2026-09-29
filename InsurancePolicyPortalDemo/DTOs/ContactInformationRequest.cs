using System.ComponentModel.DataAnnotations;

namespace InsurancePolicyPortalDemo.DTOs;

public class ContactInformationRequest
{
    [Required]
    [EmailAddress]
    public string Email { get; set; } = string.Empty;

    [Required]
    public string Phone { get; set; } = string.Empty;

    public string StreetAddress { get; set; } = string.Empty;

    public string StreetAddressLine2 { get; set; } = string.Empty;

    [Required]
    public string City { get; set; } = string.Empty;

    [Required]
    public string State { get; set; } = string.Empty;

    [Required]
    public string ZipCode { get; set; } = string.Empty;

    [Required]
    public string Country { get; set; } = string.Empty;
}