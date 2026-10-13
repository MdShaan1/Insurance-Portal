using System.ComponentModel.DataAnnotations;
namespace InsurancePolicyPortalDemo.DTOs;

public sealed class SecurityInformationRequest
{
    [Required]
    [MinLength(2, ErrorMessage = "Pet name is required.")]
    [StringLength(100)]
    public string PetName { get; set; } = string.Empty;

    [Required]
    [MinLength(2, ErrorMessage = "Childhood friend name is required.")]
    [StringLength(100)]
    public string ChildhoodFriendName { get; set; } = string.Empty;
}