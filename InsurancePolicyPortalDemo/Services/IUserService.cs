using InsurancePolicyPortalDemo.DTOs;

namespace InsurancePolicyPortalDemo.Services;

public interface IUserService
{
    Task<bool> VerifyPolicyHolderAsync(
        PersonalInformationRequest request);

    Task<UserResponse> RegisterAsync(
        PersonalInformationRequest personalInformation,
        AccountInformationRequest accountInformation,
        SecurityInformationRequest securityInformation,
        ContactInformationRequest contactInformation);

    Task<UserResponse?> LoginAsync(
        UserLoginRequest request);
}