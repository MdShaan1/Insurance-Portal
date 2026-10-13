using System.ComponentModel.DataAnnotations;

namespace InsurancePolicyPortalDemo.Services;

public sealed class SecurityQuestionOptions
{
    public const string SectionName = "SecurityQuestions";

    [Required]
    [StringLength(150, MinimumLength = 2)]
    public string PetName { get; set; } = string.Empty;

    [Required]
    [StringLength(150, MinimumLength = 2)]
    public string ChildhoodFriendName { get; set; } = string.Empty;
}
