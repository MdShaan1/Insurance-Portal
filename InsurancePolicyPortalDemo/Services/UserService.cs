using InsurancePolicyPortalDemo.DTOs;
using InsurancePolicyPortalDemo.Models;
using InsurancePolicyPortalDemo.Repositories;
using Microsoft.AspNetCore.Identity;

namespace InsurancePolicyPortalDemo.Services;

public class UserService : IUserService
{
    private readonly IUserRepository _userRepository;

    private readonly IPolicyHolderRepository _policyHolderRepository;

    private readonly PasswordHasher<User> _passwordHasher;


    public UserService(
        IUserRepository userRepository,
        IPolicyHolderRepository policyHolderRepository)
    {
        _userRepository = userRepository;

        _policyHolderRepository = policyHolderRepository;

        _passwordHasher = new PasswordHasher<User>();
    }


    public async Task<bool> VerifyPolicyHolderAsync(
        PersonalInformationRequest request)
    {
        var policyHolder =
            await _policyHolderRepository
                .GetByPolicyNumberAsync(
                    request.PolicyNumber
                );

        if (policyHolder == null)
        {
            return false;
        }


        bool isValid =
            policyHolder.SSN.Equals(
                request.SSN.Trim(),
                StringComparison.OrdinalIgnoreCase
            )
            &&
            policyHolder.PolicyNumber.Equals(
                request.PolicyNumber.Trim(),
                StringComparison.OrdinalIgnoreCase
            )
            &&
            policyHolder.FirstName.Equals(
                request.FirstName.Trim(),
                StringComparison.OrdinalIgnoreCase
            )
            &&
            policyHolder.LastName.Equals(
                request.LastName.Trim(),
                StringComparison.OrdinalIgnoreCase
            )
            &&
            policyHolder.DateOfBirth.Equals(
                request.DateOfBirth.Trim(),
                StringComparison.OrdinalIgnoreCase
            )
            &&
            policyHolder.ZipCode.Equals(
                request.ZipCode.Trim(),
                StringComparison.OrdinalIgnoreCase
            );


        return isValid;
    }


    public async Task<UserResponse> RegisterAsync(
        PersonalInformationRequest personalInformation,
        AccountInformationRequest accountInformation,
        SecurityInformationRequest securityInformation,
        ContactInformationRequest contactInformation)
    {
        // Verify policyholder again before creating account

        var isPolicyHolderValid =
            await VerifyPolicyHolderAsync(
                personalInformation
            );

        if (!isPolicyHolderValid)
        {
            throw new InvalidOperationException(
                "Policyholder verification failed."
            );
        }


        // Check if an account already exists
        // for this policy number

        var existingAccount =
            await _userRepository.GetByPolicyNumberAsync(
                personalInformation.PolicyNumber.Trim()
            );

        if (existingAccount != null)
        {
            throw new InvalidOperationException(
                "An account has already been created for this policy number."
            );
        }


        // Check username uniqueness

        var existingUser =
            await _userRepository.GetByUsernameAsync(
                accountInformation.Username.Trim()
            );

        if (existingUser != null)
        {
            throw new InvalidOperationException(
                "Username already exists."
            );
        }


        // Create User object

        var user = new User
        {
            // Personal Information

            PolicyNumber =
                personalInformation.PolicyNumber.Trim(),

            FirstName =
                personalInformation.FirstName.Trim(),

            LastName =
                personalInformation.LastName.Trim(),

            DateOfBirth =
                personalInformation.DateOfBirth.Trim(),

            ZipCode =
                personalInformation.ZipCode.Trim(),


            // Account Information

            Username =
                accountInformation.Username.Trim(),


            // Contact Information

            Email =
                contactInformation.Email.Trim(),

            Phone =
                contactInformation.Phone.Trim(),

            StreetAddress =
                contactInformation.StreetAddress.Trim(),

            StreetAddressLine2 =
                contactInformation.StreetAddressLine2.Trim(),

            City =
                contactInformation.City.Trim(),

            State =
                contactInformation.State.Trim(),

            Country =
                contactInformation.Country.Trim(),


            // Security Information

            SecurityQuestions = new List<SecurityQuestion>
            {
                new SecurityQuestion
                {
                    Question = "What is your pet name?",
                    Answer = securityInformation.PetName.Trim()
                },

                new SecurityQuestion
                {
                    Question = "What is your childhood friend's name?",
                    Answer = securityInformation.ChildhoodFriendName.Trim()
                }
            }
        };


        // Hash password before storing it

        user.PasswordHash =
            _passwordHasher.HashPassword(
                user,
                accountInformation.Password
            );


        // Save user to database/repository

        var createdUser =
            await _userRepository.AddAsync(user);


        // Return user information without password

        return new UserResponse
        {
            Id = createdUser.Id,

            FirstName = createdUser.FirstName,

            LastName = createdUser.LastName,

            PolicyNumber = createdUser.PolicyNumber,

            Username = createdUser.Username,

            Email = createdUser.Email,

            CreatedAt = createdUser.CreatedAt
        };
    }


    public async Task<UserResponse?> LoginAsync(
        UserLoginRequest request)
    {
        var user =
            await _userRepository.GetByUsernameAsync(
                request.Username
            );

        if (user == null)
        {
            return null;
        }


        var result =
            _passwordHasher.VerifyHashedPassword(
                user,
                user.PasswordHash,
                request.Password
            );


        if (result ==
            PasswordVerificationResult.Failed)
        {
            return null;
        }


        return new UserResponse
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
}