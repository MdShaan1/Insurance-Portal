using System.ComponentModel.DataAnnotations;

namespace InsurancePolicyPortalDemo.DTOs;

public class SecurityQuestionRequest
{
    [Required]
    public string Answer { get; set; } = string.Empty;
}