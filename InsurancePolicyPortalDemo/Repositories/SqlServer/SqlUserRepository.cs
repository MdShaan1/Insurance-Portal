using InsurancePolicyPortalDemo.Data;
using InsurancePolicyPortalDemo.Entities;
using InsurancePolicyPortalDemo.Models;
using Microsoft.EntityFrameworkCore;

namespace InsurancePolicyPortalDemo.Repositories;

public class SqlUserRepository : IUserRepository
{
    private readonly InsurancePolicyPortalDbContext _context;

    public SqlUserRepository(
        InsurancePolicyPortalDbContext context)
    {
        _context = context;
    }

    private static User MapToModel(UserEntity entity)
    {
        return new User
        {
            Id = entity.Id,
            PolicyNumber = entity.PolicyNumber,
            FirstName = entity.FirstName,
            LastName = entity.LastName,
            DateOfBirth = entity.DateOfBirth,
            ZipCode = entity.ZipCode,
            Username = entity.Username,
            PasswordHash = entity.PasswordHash,

            SecurityQuestions =
                entity.SecurityQuestions
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
        return new UserEntity
        {
            Id = user.Id,
            PolicyNumber = user.PolicyNumber,
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
                user.SecurityQuestions
                    .Select(q => new SecurityQuestionEntity
                    {
                        UserId = user.Id,
                        Question = q.Question,
                        Answer = q.Answer
                    })
                    .ToList()
        };
    }

    public async Task<List<User>> GetAllAsync()
    {
        var entities =
            await _context.Users
                .Include(u => u.SecurityQuestions)
                .ToListAsync();

        return entities
            .Select(MapToModel)
            .ToList();
    }

    public async Task<User?> GetByIdAsync(Guid id)
    {
        var entity =
            await _context.Users
                .Include(u => u.SecurityQuestions)
                .FirstOrDefaultAsync(
                    u => u.Id == id
                );

        return entity == null
            ? null
            : MapToModel(entity);
    }

    public async Task<User?> GetByUsernameAsync(
        string username)
    {
        var entity =
            await _context.Users
                .Include(u => u.SecurityQuestions)
                .FirstOrDefaultAsync(
                    u => u.Username == username
                );

        return entity == null
            ? null
            : MapToModel(entity);
    }

    // Get user by Policy Number
    public async Task<User?> GetByPolicyNumberAsync(
        string policyNumber)
    {
        var entity =
            await _context.Users
                .Include(u => u.SecurityQuestions)
                .FirstOrDefaultAsync(
                    u => u.PolicyNumber == policyNumber
                );

        return entity == null
            ? null
            : MapToModel(entity);
    }

    public async Task<User> AddAsync(User user)
    {
        if (user.Id == Guid.Empty)
        {
            user.Id = Guid.NewGuid();
        }

        if (user.CreatedAt == default)
        {
            user.CreatedAt = DateTime.UtcNow;
        }

        var entity = MapToEntity(user);

        _context.Users.Add(entity);

        await _context.SaveChangesAsync();

        return MapToModel(entity);
    }

    public async Task<User> UpdateAsync(User user)
    {
        var entity =
            await _context.Users
                .Include(u => u.SecurityQuestions)
                .FirstOrDefaultAsync(
                    u => u.Id == user.Id
                );

        if (entity == null)
        {
            throw new KeyNotFoundException(
                "User not found."
            );
        }

        entity.PolicyNumber = user.PolicyNumber;
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

        _context.SecurityQuestions.RemoveRange(
            entity.SecurityQuestions
        );

        entity.SecurityQuestions =
            user.SecurityQuestions
                .Select(q => new SecurityQuestionEntity
                {
                    UserId = user.Id,
                    Question = q.Question,
                    Answer = q.Answer
                })
                .ToList();

        await _context.SaveChangesAsync();

        return MapToModel(entity);
    }

    public async Task<bool> DeleteAsync(Guid id)
    {
        var entity =
            await _context.Users
                .FirstOrDefaultAsync(
                    u => u.Id == id
                );

        if (entity == null)
        {
            return false;
        }

        _context.Users.Remove(entity);

        await _context.SaveChangesAsync();

        return true;
    }
}