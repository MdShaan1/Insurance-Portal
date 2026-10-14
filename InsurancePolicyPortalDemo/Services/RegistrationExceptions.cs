namespace InsurancePolicyPortalDemo.Services;

public sealed class PolicyholderValidationException(string field)
    : Exception("The policyholder details could not be verified.")
{
    public string Field { get; } = field;
}
public sealed class RegistrationConflictException(string field, string message)
    : Exception(message)
{
    public string Field { get; } = field;
}
