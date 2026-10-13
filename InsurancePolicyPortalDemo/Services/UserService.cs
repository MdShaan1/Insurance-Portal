using InsurancePolicyPortalDemo.DTOs;
using InsurancePolicyPortalDemo.Models;
using InsurancePolicyPortalDemo.Repositories;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Options;

namespace InsurancePolicyPortalDemo.Services;

public sealed class UserService(
    IUserRepository userRepository,
    IPolicyHolderRepository policyHolderRepository,
    IPasswordHasher<User> passwordHasher,
    IOptions<SecurityQuestionOptions> securityQuestionOptions) : IUserService
{
    private static string Normalize(string? value) => value?.Trim() ?? string.Empty;

    public async Task<bool> VerifyPolicyHolderAsync(
        PersonalInformationRequest request,
        CancellationToken cancellationToken = default)
    {
        ArgumentNullException.ThrowIfNull(request);
        var policyHolder = await policyHolderRepository.GetByPolicyNumberAsync(
            Normalize(request.PolicyNumber),
            cancellationToken);

        var isVerified = policyHolder is not null
            && Matches(policyHolder.SSN, request.SSN)
            && Matches(policyHolder.PolicyNumber, request.PolicyNumber)
            && Matches(policyHolder.FirstName, request.FirstName)
            && Matches(policyHolder.LastName, request.LastName)
            && Matches(policyHolder.DateOfBirth, request.DateOfBirth)
            && Matches(policyHolder.ZipCode, request.ZipCode);

        if (!isVerified)
        {
            return false;
        }

        if (await userRepository.GetByPolicyNumberAsync(
                Normalize(request.PolicyNumber),
                cancellationToken) is not null)
        {
            throw new RegistrationConflictException(
                "personalInformation.policyNumber",
                "An account has already been created for this policy number.");
        }

        return true;
    }

    public async Task<UserResponse> RegisterAsync(
        RegistrationRequest request,
        CancellationToken cancellationToken = default)
    {
        ArgumentNullException.ThrowIfNull(request);

        var personal = request.PersonalInformation;
        var account = request.AccountInformation;
        var security = request.SecurityInformation;
        var contact = request.ContactInformation;

        var policyHolder = await policyHolderRepository.GetByPolicyNumberAsync(
            Normalize(personal.PolicyNumber),
            cancellationToken);

        if (policyHolder is null
            || !Matches(policyHolder.SSN, personal.SSN)
            || !Matches(policyHolder.PolicyNumber, personal.PolicyNumber)
            || !Matches(policyHolder.FirstName, personal.FirstName)
            || !Matches(policyHolder.LastName, personal.LastName)
            || !Matches(policyHolder.DateOfBirth, personal.DateOfBirth)
            || !Matches(policyHolder.ZipCode, personal.ZipCode))
        {
            throw new PolicyholderValidationException("personalInformation");
        }

        var policyNumber = Normalize(personal.PolicyNumber);
        if (await userRepository.GetByPolicyNumberAsync(policyNumber, cancellationToken) is not null)
        {
            throw new RegistrationConflictException(
                "personalInformation.policyNumber",
                "An account has already been created for this policy number.");
        }

        var username = Normalize(account.Username);
        if (await userRepository.GetByUsernameAsync(username, cancellationToken) is not null)
        {
            throw new RegistrationConflictException(
                "accountInformation.username",
                "Username already exists.");
        }

        var user = new User
        {
            PolicyHolderId = policyHolder.Id,
            PolicyNumber = policyNumber,
            FirstName = Normalize(personal.FirstName),
            LastName = Normalize(personal.LastName),
            DateOfBirth = Normalize(personal.DateOfBirth),
            ZipCode = Normalize(personal.ZipCode),
            Username = username,
            Email = Normalize(contact.Email),
            Phone = Normalize(contact.Phone),
            StreetAddress = Normalize(contact.StreetAddress),
            StreetAddressLine2 = Normalize(contact.StreetAddressLine2),
            City = Normalize(contact.City),
            State = Normalize(contact.State),
            Country = Normalize(contact.Country),
        };

        user.PasswordHash = passwordHasher.HashPassword(user, account.Password);
        user.SecurityQuestions =
        [
            new SecurityQuestion
            {
                Question = securityQuestionOptions.Value.PetName,
                Answer = passwordHasher.HashPassword(user, Normalize(security.PetName))
            },
            new SecurityQuestion
            {
                Question = securityQuestionOptions.Value.ChildhoodFriendName,
                Answer = passwordHasher.HashPassword(user, Normalize(security.ChildhoodFriendName))
            }
        ];
        var createdUser = await userRepository.AddAsync(user, cancellationToken);
        return ToResponse(createdUser);
    }

    public async Task<UserResponse?> LoginAsync(
        UserLoginRequest request,
        CancellationToken cancellationToken = default)
    {
        ArgumentNullException.ThrowIfNull(request);
        var username = Normalize(request.Username);
        if (username.Length == 0 || string.IsNullOrEmpty(request.Password))
        {
            return null;
        }

        var user = await userRepository.GetByUsernameAsync(username, cancellationToken);
        if (user is null)
        {
            return null;
        }

        var result = passwordHasher.VerifyHashedPassword(
            user,
            user.PasswordHash,
            request.Password);
        if (result == PasswordVerificationResult.Failed)
        {
            return null;
        }

        if (result == PasswordVerificationResult.SuccessRehashNeeded)
        {
            user.PasswordHash = passwordHasher.HashPassword(user, request.Password);
            await userRepository.UpdateAsync(user, cancellationToken);
        }

        return ToResponse(user);
    }

    public async Task<UserResponse?> GetByIdAsync(
        Guid id,
        CancellationToken cancellationToken = default)
    {
        var user = await userRepository.GetByIdAsync(id, cancellationToken);
        return user is null ? null : ToResponse(user);
    }

    private static bool Matches(string? actual, string? supplied) =>
        string.Equals(Normalize(actual), Normalize(supplied), StringComparison.OrdinalIgnoreCase);

    private static UserResponse ToResponse(User user) => new()
    {
        Id = user.Id,
        FirstName = user.FirstName,
        LastName = user.LastName,
        PolicyNumber = user.PolicyNumber,
        Username = user.Username,
        Email = user.Email,
        CreatedAt = user.CreatedAt
    };
}
