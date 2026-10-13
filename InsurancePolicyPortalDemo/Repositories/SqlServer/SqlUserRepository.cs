
using InsurancePolicyPortalDemo.Data;
using InsurancePolicyPortalDemo.Entities;
using InsurancePolicyPortalDemo.Models;
using Microsoft.EntityFrameworkCore;
using InsurancePolicyPortalDemo.Services;
using Microsoft.Data.SqlClient;

namespace InsurancePolicyPortalDemo.Repositories;

public class SqlUserRepository : IUserRepository
{
    private readonly InsurancePolicyPortalDbContext _context;

    public SqlUserRepository(InsurancePolicyPortalDbContext context)
    {
        _context = context;
    }

    private static User MapToModel(UserEntity entity)
    {
        ArgumentNullException.ThrowIfNull(entity);

        var policyHolder = entity.PolicyHolder;

        return new User
        {
            Id = entity.Id,
            PolicyHolderId = entity.PolicyHolderId,

            PolicyNumber = policyHolder?.PolicyNumber ?? entity.PolicyNumber,
            FirstName = policyHolder?.FirstName ?? entity.FirstName,
            LastName = policyHolder?.LastName ?? entity.LastName,
            DateOfBirth = policyHolder?.DateOfBirth ?? entity.DateOfBirth,
            ZipCode = policyHolder?.ZipCode ?? entity.ZipCode,

            Username = entity.Username,
            PasswordHash = entity.PasswordHash,

            SecurityQuestions =
                (entity.SecurityQuestions ?? new List<SecurityQuestionEntity>())
                    .Select(q => new SecurityQuestion
                    {
                        Question = q.Question,
                        Answer = q.Answer
                    })
                    .ToList(),

            Email = entity.Email,
            Phone = entity.Phone,
            StreetAddress = entity.StreetAddress,
            StreetAddressLine2 = entity.StreetAddressLine2,
            City = entity.City,
            State = entity.State,
            Country = entity.Country,
            CreatedAt = entity.CreatedAt
        };
    }

    private static UserEntity MapToEntity(User user)
    {
        ArgumentNullException.ThrowIfNull(user);

        return new UserEntity
        {
            Id = user.Id,
            PolicyHolderId = user.PolicyHolderId,
            PolicyNumber = user.PolicyNumber,

            // Preserve personal information instead of saving empty strings.
            FirstName = user.FirstName,
            LastName = user.LastName,
            DateOfBirth = user.DateOfBirth,
            ZipCode = user.ZipCode,

            Username = user.Username,
            PasswordHash = user.PasswordHash,

            Email = user.Email,
            Phone = user.Phone,
            StreetAddress = user.StreetAddress,
            StreetAddressLine2 = user.StreetAddressLine2,
            City = user.City,
            State = user.State,
            Country = user.Country,
            CreatedAt = user.CreatedAt,

            SecurityQuestions =
                (user.SecurityQuestions ?? new List<SecurityQuestion>())
                    .Select(q => new SecurityQuestionEntity
                    {
                        UserId = user.Id,
                        Question = q.Question,
                        Answer = q.Answer
                    })
                    .ToList()
        };
    }

    public async Task<List<User>> GetAllAsync(
        CancellationToken cancellationToken = default)
    {
        var entities = await _context.Users
            .Include(u => u.SecurityQuestions)
            .Include(u => u.PolicyHolder)
            .AsNoTracking()
            .ToListAsync(cancellationToken);

        return entities.Select(MapToModel).ToList();
    }

    public async Task<User?> GetByIdAsync(
        Guid id,
        CancellationToken cancellationToken = default)
    {
        var entity = await _context.Users
            .Include(u => u.PolicyHolder)
            .AsNoTracking()
            .FirstOrDefaultAsync(
                u => u.Id == id,
                cancellationToken);

        return entity is null ? null : MapToModel(entity);
    }

    public async Task<User?> GetByUsernameAsync(
        string username,
        CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(username))
        {
            return null;
        }

        var normalizedUsername = username.Trim();

        var entity = await _context.Users
            .Include(u => u.PolicyHolder)
            .AsNoTracking()
            .FirstOrDefaultAsync(
                u => u.Username == normalizedUsername,
                cancellationToken);

        return entity is null ? null : MapToModel(entity);
    }

    public async Task<User?> GetByPolicyNumberAsync(
        string policyNumber,
        CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(policyNumber))
        {
            return null;
        }

        var normalizedPolicyNumber = policyNumber.Trim();

        var entity = await _context.Users
            .Include(u => u.PolicyHolder)
            .AsNoTracking()
            .FirstOrDefaultAsync(
                u => u.PolicyNumber == normalizedPolicyNumber,
                cancellationToken);

        return entity is null ? null : MapToModel(entity);
    }

    public async Task<User> AddAsync(
        User user,
        CancellationToken cancellationToken = default)
    {
        ArgumentNullException.ThrowIfNull(user);

        if (user.Id == Guid.Empty)
        {
            user.Id = Guid.NewGuid();
        }

        if (user.CreatedAt == default)
        {
            user.CreatedAt = DateTime.UtcNow;
        }

        var entity = MapToEntity(user);

        if (user.PolicyHolderId is int policyHolderId)
        {
            entity.PolicyHolder = await _context.PolicyHolders.FindAsync(
                [policyHolderId],
                cancellationToken);

            if (entity.PolicyHolder is null)
            {
                throw new PolicyholderValidationException(
                    "personalInformation");
            }
        }

        _context.Users.Add(entity);

        try
        {
            await _context.SaveChangesAsync(cancellationToken);
        }
        catch (DbUpdateException exception)
            when (IsUniqueConstraintViolation(exception))
        {
            var sqlException = FindSqlException(exception);

            var isUsername = sqlException?.Message.Contains(
                "IX_Users_Username",
                StringComparison.OrdinalIgnoreCase) == true;

            throw new RegistrationConflictException(
                isUsername
                    ? "accountInformation.username"
                    : "personalInformation.policyNumber",
                isUsername
                    ? "Username already exists."
                    : "An account has already been created for this policy number.");
        }

        return MapToModel(entity);
    }

    public async Task<User> UpdateAsync(
        User user,
        CancellationToken cancellationToken = default)
    {
        var entity = await _context.Users
            .Include(u => u.SecurityQuestions)
            .Include(u => u.PolicyHolder)
            .FirstOrDefaultAsync(
                u => u.Id == user.Id,
                cancellationToken);

        if (entity is null)
        {
            throw new KeyNotFoundException("User not found.");
        }

        entity.PolicyNumber = user.PolicyNumber;
        entity.PolicyHolderId = user.PolicyHolderId;

        // Keep the user entity's personal information synchronized.
        entity.FirstName = user.FirstName;
        entity.LastName = user.LastName;
        entity.DateOfBirth = user.DateOfBirth;
        entity.ZipCode = user.ZipCode;

        entity.Username = user.Username;
        entity.PasswordHash = user.PasswordHash;
        entity.Email = user.Email;
        entity.Phone = user.Phone;
        entity.StreetAddress = user.StreetAddress;
        entity.StreetAddressLine2 = user.StreetAddressLine2;
        entity.City = user.City;
        entity.State = user.State;
        entity.Country = user.Country;

        if (user.SecurityQuestions.Count > 0)
        {
            _context.SecurityQuestions.RemoveRange(entity.SecurityQuestions);

            entity.SecurityQuestions =
                user.SecurityQuestions
                    .Select(q => new SecurityQuestionEntity
                    {
                        UserId = user.Id,
                        Question = q.Question,
                        Answer = q.Answer
                    })
                    .ToList();
        }

        await _context.SaveChangesAsync(cancellationToken);

        return MapToModel(entity);
    }

    public async Task<bool> DeleteAsync(
        Guid id,
        CancellationToken cancellationToken = default)
    {
        var entity = await _context.Users
            .FirstOrDefaultAsync(
                u => u.Id == id,
                cancellationToken);

        if (entity is null)
        {
            return false;
        }

        _context.Users.Remove(entity);

        await _context.SaveChangesAsync(cancellationToken);

        return true;
    }

    private static bool IsUniqueConstraintViolation(
        DbUpdateException exception) =>
        FindSqlException(exception)?.Number is 2601 or 2627;

    private static SqlException? FindSqlException(Exception exception)
    {
        for (var current = exception;
             current is not null;
             current = current.InnerException!)
        {
            if (current is SqlException sqlException)
            {
                return sqlException;
            }

            if (current.InnerException is null)
            {
                break;
            }
        }

        return null;
    }
}
