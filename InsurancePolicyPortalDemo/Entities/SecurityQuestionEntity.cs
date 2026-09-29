namespace InsurancePolicyPortalDemo.Entities;

public class SecurityQuestionEntity
{
    public int Id { get; set; }

    public Guid UserId { get; set; }

    public string Question { get; set; } = string.Empty;

    public string Answer { get; set; } = string.Empty;

    public UserEntity? User { get; set; }
}