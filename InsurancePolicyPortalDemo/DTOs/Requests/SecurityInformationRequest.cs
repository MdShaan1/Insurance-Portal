using System.ComponentModel.DataAnnotations;
namespace InsurancePolicyPortalDemo.DTOs;
public class SecurityInformationRequest
{
    [Required]
    public string PetName { get; set; } = string.Empty;
    [Required]
    public string ChildhoodFriendName { get; set; } = string.Empty;
}