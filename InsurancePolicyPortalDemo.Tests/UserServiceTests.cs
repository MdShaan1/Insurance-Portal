using InsurancePolicyPortalDemo.DTOs;
using InsurancePolicyPortalDemo.Models;
using InsurancePolicyPortalDemo.Repositories;
using InsurancePolicyPortalDemo.Services;
using Microsoft.AspNetCore.Identity;
using Moq;
using NUnit.Framework;

namespace InsurancePolicyPortalDemo.Tests;

[TestFixture]
public class UserServiceTests
{
    private Mock<IUserRepository> _userRepositoryMock = null!;
    private Mock<IPolicyHolderRepository> _policyHolderRepositoryMock = null!;
    private UserService _userService = null!;

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
                _policyHolderRepositoryMock.Object
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
            Email = "hari.dwh66@gmail.com",
            Phone = "9004008000",
            Id = "10"
        };

        _policyHolderRepositoryMock
            .Setup(repo =>
                repo.GetByPolicyNumberAsync("VA6666667"))
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
            Email = "hari.dwh66@gmail.com",
            Phone = "9004008000",
            Id = "10"
        };

        // Policyholder exists

        _policyHolderRepositoryMock
            .Setup(repo =>
                repo.GetByPolicyNumberAsync("VA6666667"))
            .ReturnsAsync(policyHolder);

        // No existing account

        _userRepositoryMock
            .Setup(repo =>
                repo.GetByPolicyNumberAsync("VA6666667"))
            .ReturnsAsync((User?)null);

        // Username is available

        _userRepositoryMock
            .Setup(repo =>
                repo.GetByUsernameAsync("chandler123"))
            .ReturnsAsync((User?)null);

        // Save user successfully

        _userRepositoryMock
            .Setup(repo =>
                repo.AddAsync(It.IsAny<User>()))
            .ReturnsAsync((User user) =>
            {
                user.Id = Guid.NewGuid();
                user.CreatedAt = DateTime.UtcNow;

                return user;
            });

        // Act

        var result =
            await _userService.RegisterAsync(
                personalInformation,
                accountInformation,
                securityInformation,
                contactInformation
            );

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
                repo.GetByUsernameAsync("chandler123"))
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
}