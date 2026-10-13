using InsurancePolicyPortalDemo.DTOs;

namespace InsurancePolicyPortalDemo.Services;

public interface IUserService
{
    Task<bool> VerifyPolicyHolderAsync(
        PersonalInformationRequest request,
        CancellationToken cancellationToken = default);

    Task<UserResponse> RegisterAsync(
        RegistrationRequest request,
        CancellationToken cancellationToken = default);

    Task<UserResponse?> LoginAsync(
        UserLoginRequest request,
        CancellationToken cancellationToken = default);

    Task<UserResponse?> GetByIdAsync(
        Guid id,
        CancellationToken cancellationToken = default);
}