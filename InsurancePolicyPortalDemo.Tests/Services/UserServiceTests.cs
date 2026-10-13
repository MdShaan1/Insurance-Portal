using InsurancePolicyPortalDemo.DTOs;
using InsurancePolicyPortalDemo.Models;
using InsurancePolicyPortalDemo.Repositories;
using InsurancePolicyPortalDemo.Services;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Options;
using Moq;
using NUnit.Framework;

namespace InsurancePolicyPortalDemo.Tests;

[TestFixture]
public class UserServiceTests
{
    private Mock<IUserRepository> _userRepositoryMock = null!;
    private Mock<IPolicyHolderRepository> _policyHolderRepositoryMock = null!;
    private UserService _userService = null!;

    private static RegistrationRequest Registration(
        PersonalInformationRequest personal,
        AccountInformationRequest account,
        SecurityInformationRequest security,
        ContactInformationRequest contact) => new()
    {
        PersonalInformation = personal,
        AccountInformation = account,
        SecurityInformation = security,
        ContactInformation = contact
    };

    [SetUp]
    public void SetUp()
    {
        _userRepositoryMock =
            new Mock<IUserRepository>();

        _policyHolderRepositoryMock =
            new Mock<IPolicyHolderRepository>();

        _userService =
            new UserService(
                _userRepositoryMock.Object,
                _policyHolderRepositoryMock.Object,
                new PasswordHasher<User>(),
                Options.Create(new SecurityQuestionOptions
                {
                    PetName = "What is your pet name?",
                    ChildhoodFriendName = "What is your childhood friend's name?"
                })
            );
    }

    // =========================================================
    // 1. POLICYHOLDER VALIDATION - SUCCESS CASE
    // =========================================================

    [Test]
    public async Task VerifyPolicyHolder_WithValidDetails_ReturnsTrue()
    {
        // Arrange

        var request = new PersonalInformationRequest
        {
            SSN = "6666",
            PolicyNumber = "VA6666667",
            FirstName = "Chandler",
            LastName = "Bing",
            DateOfBirth = "11/20/2024",
            ZipCode = "99501"
        };

        var policyHolder = new PolicyHolder
        {
            SSN = "6666",
            PolicyNumber = "VA6666667",
            FirstName = "Chandler",
            LastName = "Bing",
            DateOfBirth = "11/20/2024",
            ZipCode = "99501",
            Email = "chandler@example.test",
            Phone = "9004008000",
            Id = 10
        };

        _policyHolderRepositoryMock
            .Setup(repo =>
                repo.GetByPolicyNumberAsync("VA6666667", It.IsAny<CancellationToken>()))
            .ReturnsAsync(policyHolder);

        // Act

        var result =
            await _userService.VerifyPolicyHolderAsync(request);

        // Assert

        Assert.That(result, Is.True);
    }


    // =========================================================
    // 2. REGISTRATION - SUCCESS CASE
    // =========================================================

    [Test]
    public async Task Register_WithValidDetails_ReturnsUserResponse()
    {
        // Arrange

        var personalInformation =
            new PersonalInformationRequest
            {
                SSN = "6666",
                PolicyNumber = "VA6666667",
                FirstName = "Chandler",
                LastName = "Bing",
                DateOfBirth = "11/20/2024",
                ZipCode = "99501"
            };

        var accountInformation =
            new AccountInformationRequest
            {
                Username = "chandler123",
                Password = "Password123!",
                ConfirmPassword = "Password123!"
            };

        var securityInformation =
            new SecurityInformationRequest
            {
                PetName = "Max",
                ChildhoodFriendName = "Joey"
            };

        var contactInformation =
            new ContactInformationRequest
            {
                Email = "chandler@example.com",
                Phone = "9004008000",
                StreetAddress = "123 Main Street",
                StreetAddressLine2 = "Apartment 4B",
                City = "Kochi",
                State = "Kerala",
                ZipCode = "99501",
                Country = "India"
            };

        var policyHolder = new PolicyHolder
        {
            SSN = "6666",
            PolicyNumber = "VA6666667",
            FirstName = "Chandler",
            LastName = "Bing",
            DateOfBirth = "11/20/2024",
            ZipCode = "99501",
            Email = "chandler@example.test",
            Phone = "9004008000",
            Id = 10
        };

        // Policyholder exists

        _policyHolderRepositoryMock
            .Setup(repo =>
                repo.GetByPolicyNumberAsync("VA6666667", It.IsAny<CancellationToken>()))
            .ReturnsAsync(policyHolder);

        // No existing account

        _userRepositoryMock
            .Setup(repo =>
                repo.GetByPolicyNumberAsync("VA6666667", It.IsAny<CancellationToken>()))
            .ReturnsAsync((User?)null);

        // Username is available

        _userRepositoryMock
            .Setup(repo =>
                repo.GetByUsernameAsync("chandler123", It.IsAny<CancellationToken>()))
            .ReturnsAsync((User?)null);

        // Save user successfully

        User? savedUser = null;
        _userRepositoryMock
            .Setup(repo =>
                repo.AddAsync(It.IsAny<User>(), It.IsAny<CancellationToken>()))
            .Callback<User, CancellationToken>((user, _) => savedUser = user)
            .ReturnsAsync((User user, CancellationToken _) =>
            {
                user.Id = Guid.NewGuid();
                user.CreatedAt = DateTime.UtcNow;
                return user;
            });

        // Act

        var result =
            await _userService.RegisterAsync(Registration(
                personalInformation,
                accountInformation,
                securityInformation,
                contactInformation));

        // Assert

        Assert.That(result, Is.Not.Null);

        Assert.That(
            result.Username,
            Is.EqualTo("chandler123"));

        Assert.That(
            result.FirstName,
            Is.EqualTo("Chandler"));

        Assert.That(
            result.LastName,
            Is.EqualTo("Bing"));

        Assert.That(
            result.PolicyNumber,
            Is.EqualTo("VA6666667"));

        Assert.That(
            result.Email,
            Is.EqualTo("chandler@example.com"));
        Assert.That(savedUser, Is.Not.Null);
        Assert.That(savedUser!.PolicyHolderId, Is.EqualTo(10));
        Assert.That(savedUser.SecurityQuestions, Has.Count.EqualTo(2));
        Assert.That(savedUser.SecurityQuestions[0].Question, Is.EqualTo("What is your pet name?"));
        Assert.That(
            savedUser.SecurityQuestions[1].Question,
            Is.EqualTo("What is your childhood friend's name?"));
        Assert.That(savedUser.SecurityQuestions[0].Answer, Is.Not.EqualTo("Max"));
        Assert.That(savedUser.SecurityQuestions[1].Answer, Is.Not.EqualTo("Joey"));
        Assert.That(
            new PasswordHasher<User>().VerifyHashedPassword(
                savedUser,
                savedUser.SecurityQuestions[0].Answer,
                "Max"),
            Is.EqualTo(PasswordVerificationResult.Success));
    }


    // =========================================================
    // 3. LOGIN - SUCCESS CASE
    // =========================================================

    [Test]
    public async Task Login_WithValidCredentials_ReturnsUserResponse()
    {
        // Arrange

        var user = new User
        {
            Id = Guid.NewGuid(),

            PolicyNumber = "VA6666667",

            FirstName = "Chandler",

            LastName = "Bing",

            DateOfBirth = "11/20/2024",

            ZipCode = "99501",

            Username = "chandler123",

            Email = "chandler@example.com",

            Phone = "9004008000",

            CreatedAt = DateTime.UtcNow
        };

        // Create password hash

        var passwordHasher =
            new PasswordHasher<User>();

        user.PasswordHash =
            passwordHasher.HashPassword(
                user,
                "Password123!"
            );

        // Mock repository

        _userRepositoryMock
            .Setup(repo =>
                repo.GetByUsernameAsync("chandler123", It.IsAny<CancellationToken>()))
            .ReturnsAsync(user);

        var loginRequest =
            new UserLoginRequest
            {
                Username = "chandler123",
                Password = "Password123!"
            };

        // Act

        var result =
            await _userService.LoginAsync(loginRequest);

        // Assert

        Assert.That(result, Is.Not.Null);

        Assert.That(
            result.Username,
            Is.EqualTo("chandler123"));

        Assert.That(
            result.FirstName,
            Is.EqualTo("Chandler"));

        Assert.That(
            result.LastName,
            Is.EqualTo("Bing"));

        Assert.That(
            result.PolicyNumber,
            Is.EqualTo("VA6666667"));

        Assert.That(
            result.Email,
            Is.EqualTo("chandler@example.com"));
    }

    [Test]
    public async Task VerifyPolicyHolder_WithBlankRequest_ReturnsFalse()
    {
        var request = new PersonalInformationRequest
        {
            SSN = "   ",
            PolicyNumber = "",
            FirstName = "Chandler",
            LastName = "Bing",
            DateOfBirth = "11/20/2024",
            ZipCode = "99501"
        };

        var result = await _userService.VerifyPolicyHolderAsync(request);

        Assert.That(result, Is.False);
    }

    [Test]
    public async Task VerifyPolicyHolder_WithMismatchedIdentity_ReturnsFalse()
    {
        var request = new PersonalInformationRequest
        {
            SSN = "6666",
            PolicyNumber = "VA6666667",
            FirstName = "Chandler",
            LastName = "Bing",
            DateOfBirth = "11/20/2024",
            ZipCode = "99501"
        };

        var policyHolder = new PolicyHolder
        {
            SSN = "6666",
            PolicyNumber = "VA6666667",
            FirstName = "Chandler",
            LastName = "Bing",
            DateOfBirth = "11/20/2024",
            ZipCode = "99501",
            Email = "existing@example.com",
            Phone = "9004008000",
            Id = 10
        };

        _policyHolderRepositoryMock
            .Setup(repo => repo.GetByPolicyNumberAsync("VA6666667", It.IsAny<CancellationToken>()))
            .ReturnsAsync(policyHolder);

        request.FirstName = "Ross";

        var result = await _userService.VerifyPolicyHolderAsync(request);

        Assert.That(result, Is.False);
    }

    [Test]
    public void VerifyPolicyHolder_WithExistingAccount_ThrowsRegistrationConflictException()
    {
        const string policyNumber = "VA6666667";
        var request = new PersonalInformationRequest
        {
            SSN = "6666",
            PolicyNumber = policyNumber,
            FirstName = "Chandler",
            LastName = "Bing",
            DateOfBirth = "11/20/2024",
            ZipCode = "99501"
        };

        _policyHolderRepositoryMock
            .Setup(repo => repo.GetByPolicyNumberAsync(policyNumber, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new PolicyHolder
            {
                Id = 10,
                SSN = "6666",
                PolicyNumber = policyNumber,
                FirstName = "Chandler",
                LastName = "Bing",
                DateOfBirth = "11/20/2024",
                ZipCode = "99501"
            });
        _userRepositoryMock
            .Setup(repo => repo.GetByPolicyNumberAsync(policyNumber, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new User { PolicyNumber = policyNumber });

        var exception = Assert.ThrowsAsync<RegistrationConflictException>(
            async () => await _userService.VerifyPolicyHolderAsync(request));

        Assert.That(exception!.Field, Is.EqualTo("personalInformation.policyNumber"));
        _userRepositoryMock.Verify(
            repo => repo.AddAsync(It.IsAny<User>(), It.IsAny<CancellationToken>()),
            Times.Never);
    }

    [Test]
    public void Register_WithMismatchedPolicyholderIdentity_ThrowsValidationException()
    {
        _policyHolderRepositoryMock
            .Setup(repo => repo.GetByPolicyNumberAsync(
                "VA6666667",
                It.IsAny<CancellationToken>()))
            .ReturnsAsync(new PolicyHolder
            {
                Id = 10,
                SSN = "6666",
                PolicyNumber = "VA6666667",
                FirstName = "Chandler",
                LastName = "Bing",
                DateOfBirth = "11/20/2024",
                ZipCode = "99501"
            });

        var request = Registration(
            new PersonalInformationRequest
            {
                SSN = "6666",
                PolicyNumber = "VA6666667",
                FirstName = "Ross",
                LastName = "Bing",
                DateOfBirth = "11/20/2024",
                ZipCode = "99501"
            },
            new AccountInformationRequest(),
            new SecurityInformationRequest(),
            new ContactInformationRequest());

        Assert.ThrowsAsync<PolicyholderValidationException>(
            async () => await _userService.RegisterAsync(request));
        _userRepositoryMock.Verify(
            repository => repository.AddAsync(It.IsAny<User>(), It.IsAny<CancellationToken>()),
            Times.Never);
    }

    [Test]
    public async Task Register_WithDuplicateUsername_ThrowsInvalidOperationException()
    {
        var request = new PersonalInformationRequest
        {
            SSN = "6666",
            PolicyNumber = "VA6666667",
            FirstName = "Chandler",
            LastName = "Bing",
            DateOfBirth = "11/20/2024",
            ZipCode = "99501"
        };

        var accountRequest = new AccountInformationRequest
        {
            Username = "chandler123",
            Password = "Password123!",
            ConfirmPassword = "Password123!"
        };

        var securityRequest = new SecurityInformationRequest
        {
            PetName = "Max",
            ChildhoodFriendName = "Joey"
        };

        var contactRequest = new ContactInformationRequest
        {
            Email = "chandler@example.com",
            Phone = "9004008000",
            StreetAddress = "123 Main Street",
            StreetAddressLine2 = "Apartment 4B",
            City = "Kochi",
            State = "Kerala",
            ZipCode = "99501",
            Country = "India"
        };

        var policyHolder = new PolicyHolder
        {
            SSN = "6666",
            PolicyNumber = "VA6666667",
            FirstName = "Chandler",
            LastName = "Bing",
            DateOfBirth = "11/20/2024",
            ZipCode = "99501",
            Email = "chandler@example.test",
            Phone = "9004008000",
            Id = 10
        };

        _policyHolderRepositoryMock
            .Setup(repo => repo.GetByPolicyNumberAsync("VA6666667", It.IsAny<CancellationToken>()))
            .ReturnsAsync(policyHolder);

        _userRepositoryMock
            .Setup(repo => repo.GetByPolicyNumberAsync("VA6666667", It.IsAny<CancellationToken>()))
            .ReturnsAsync((User?)null);

        _userRepositoryMock
            .Setup(repo => repo.GetByUsernameAsync("chandler123", It.IsAny<CancellationToken>()))
            .ReturnsAsync(new User { Username = "chandler123" });

        var ex = Assert.ThrowsAsync<RegistrationConflictException>(async () =>
            await _userService.RegisterAsync(Registration(request, accountRequest, securityRequest, contactRequest)));

        Assert.That(ex!.Message, Does.Contain("Username already exists"));
    }

    [Test]
    public async Task Register_WithExistingPolicyNumber_ThrowsInvalidOperationException()
    {
        var request = new PersonalInformationRequest
        {
            SSN = "6666",
            PolicyNumber = "VA6666667",
            FirstName = "Chandler",
            LastName = "Bing",
            DateOfBirth = "11/20/2024",
            ZipCode = "99501"
        };

        var accountRequest = new AccountInformationRequest
        {
            Username = "chandler123",
            Password = "Password123!",
            ConfirmPassword = "Password123!"
        };

        var securityRequest = new SecurityInformationRequest
        {
            PetName = "Max",
            ChildhoodFriendName = "Joey"
        };

        var contactRequest = new ContactInformationRequest
        {
            Email = "chandler@example.com",
            Phone = "9004008000",
            StreetAddress = "123 Main Street",
            StreetAddressLine2 = "Apartment 4B",
            City = "Kochi",
            State = "Kerala",
            ZipCode = "99501",
            Country = "India"
        };

        var policyHolder = new PolicyHolder
        {
            SSN = "6666",
            PolicyNumber = "VA6666667",
            FirstName = "Chandler",
            LastName = "Bing",
            DateOfBirth = "11/20/2024",
            ZipCode = "99501",
            Email = "chandler@example.test",
            Phone = "9004008000",
            Id = 10
        };

        _policyHolderRepositoryMock
            .Setup(repo => repo.GetByPolicyNumberAsync("VA6666667", It.IsAny<CancellationToken>()))
            .ReturnsAsync(policyHolder);

        _userRepositoryMock
            .Setup(repo => repo.GetByPolicyNumberAsync("VA6666667", It.IsAny<CancellationToken>()))
            .ReturnsAsync(new User { PolicyNumber = "VA6666667" });

        var ex = Assert.ThrowsAsync<RegistrationConflictException>(async () =>
            await _userService.RegisterAsync(Registration(request, accountRequest, securityRequest, contactRequest)));

        Assert.That(ex!.Message, Does.Contain("already been created"));
    }

    [Test]
    public async Task Login_WithWrongPassword_ReturnsNull()
    {
        var user = new User
        {
            Id = Guid.NewGuid(),
            PolicyNumber = "VA6666667",
            FirstName = "Chandler",
            LastName = "Bing",
            DateOfBirth = "11/20/2024",
            ZipCode = "99501",
            Username = "chandler123",
            Email = "chandler@example.com",
            Phone = "9004008000",
            CreatedAt = DateTime.UtcNow
        };

        var passwordHasher = new PasswordHasher<User>();
        user.PasswordHash = passwordHasher.HashPassword(user, "CorrectPassword!123");

        _userRepositoryMock
            .Setup(repo => repo.GetByUsernameAsync("chandler123", It.IsAny<CancellationToken>()))
            .ReturnsAsync(user);

        var result = await _userService.LoginAsync(new UserLoginRequest
        {
            Username = "chandler123",
            Password = "WrongPassword!123"
        });

        Assert.That(result, Is.Null);
    }

    [Test]
    public async Task Register_WhenRepositoryPersistenceFails_ThrowsInvalidOperationException()
    {
        var request = new PersonalInformationRequest
        {
            SSN = "6666",
            PolicyNumber = "VA6666667",
            FirstName = "Chandler",
            LastName = "Bing",
            DateOfBirth = "11/20/2024",
            ZipCode = "99501"
        };

        var accountRequest = new AccountInformationRequest
        {
            Username = "chandler123",
            Password = "Password123!",
            ConfirmPassword = "Password123!"
        };

        var securityRequest = new SecurityInformationRequest
        {
            PetName = "Max",
            ChildhoodFriendName = "Joey"
        };

        var contactRequest = new ContactInformationRequest
        {
            Email = "chandler@example.com",
            Phone = "9004008000",
            StreetAddress = "123 Main Street",
            StreetAddressLine2 = "Apartment 4B",
            City = "Kochi",
            State = "Kerala",
            ZipCode = "99501",
            Country = "India"
        };

        var policyHolder = new PolicyHolder
        {
            SSN = "6666",
            PolicyNumber = "VA6666667",
            FirstName = "Chandler",
            LastName = "Bing",
            DateOfBirth = "11/20/2024",
            ZipCode = "99501",
            Email = "chandler@example.test",
            Phone = "9004008000",
            Id = 10
        };

        _policyHolderRepositoryMock
            .Setup(repo => repo.GetByPolicyNumberAsync("VA6666667", It.IsAny<CancellationToken>()))
            .ReturnsAsync(policyHolder);

        _userRepositoryMock
            .Setup(repo => repo.GetByPolicyNumberAsync("VA6666667", It.IsAny<CancellationToken>()))
            .ReturnsAsync((User?)null);

        _userRepositoryMock
            .Setup(repo => repo.GetByUsernameAsync("chandler123", It.IsAny<CancellationToken>()))
            .ReturnsAsync((User?)null);

        _userRepositoryMock
            .Setup(repo => repo.AddAsync(It.IsAny<User>(), It.IsAny<CancellationToken>()))
            .ThrowsAsync(new InvalidOperationException("Persistence failure"));

        var ex = Assert.ThrowsAsync<InvalidOperationException>(async () =>
            await _userService.RegisterAsync(Registration(request, accountRequest, securityRequest, contactRequest)));

        Assert.That(ex!.Message, Does.Contain("Persistence failure"));
    }

    [Test]
    public async Task Login_WithBlankCredentials_ReturnsNull()
    {
        var request = new UserLoginRequest
        {
            Username = "   ",
            Password = ""
        };

        var result = await _userService.LoginAsync(request);

        Assert.That(result, Is.Null);
    }
}