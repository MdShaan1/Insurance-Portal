using System.Text.Json;
using InsurancePolicyPortalDemo.Models;

namespace InsurancePolicyPortalDemo.Repositories;

public class UserRepository : IUserRepository
{
    private readonly string _filePath;

    private readonly JsonSerializerOptions _jsonOptions =
        new()
        {
            PropertyNameCaseInsensitive = true
        };


    public UserRepository(IWebHostEnvironment environment)
    {
        _filePath = Path.Combine(
            environment.ContentRootPath,
            "Data",
            "users.json"
        );
    }


    // Read all users from JSON Lines file
    private async Task<List<User>> ReadUsersAsync()
    {
        var users = new List<User>();

        if (!File.Exists(_filePath))
        {
            return users;
        }

        using var stream = new FileStream(
            _filePath,
            FileMode.Open,
            FileAccess.Read,
            FileShare.ReadWrite
        );

        using var reader = new StreamReader(stream);

        string? line;

        while ((line = await reader.ReadLineAsync()) != null)
        {
            if (string.IsNullOrWhiteSpace(line))
            {
                continue;
            }

            var user =
                JsonSerializer.Deserialize<User>(
                    line,
                    _jsonOptions
                );

            if (user != null)
            {
                users.Add(user);
            }
        }

        return users;
    }


    public async Task<List<User>> GetAllAsync()
    {
        return await ReadUsersAsync();
    }


    public async Task<User?> GetByIdAsync(Guid id)
    {
        if (!File.Exists(_filePath))
        {
            return null;
        }

        using var stream = new FileStream(
            _filePath,
            FileMode.Open,
            FileAccess.Read,
            FileShare.ReadWrite
        );

        using var reader = new StreamReader(stream);

        string? line;

        while ((line = await reader.ReadLineAsync()) != null)
        {
            if (string.IsNullOrWhiteSpace(line))
            {
                continue;
            }

            var user =
                JsonSerializer.Deserialize<User>(
                    line,
                    _jsonOptions
                );

            if (user != null && user.Id == id)
            {
                return user;
            }
        }

        return null;
    }


    public async Task<User?> GetByUsernameAsync(
        string username)
    {
        if (!File.Exists(_filePath))
        {
            return null;
        }

        using var stream = new FileStream(
            _filePath,
            FileMode.Open,
            FileAccess.Read,
            FileShare.ReadWrite
        );

        using var reader = new StreamReader(stream);

        string? line;

        while ((line = await reader.ReadLineAsync()) != null)
        {
            if (string.IsNullOrWhiteSpace(line))
            {
                continue;
            }

            var user =
                JsonSerializer.Deserialize<User>(
                    line,
                    _jsonOptions
                );

            if (
                user != null &&
                user.Username.Equals(
                    username,
                    StringComparison.OrdinalIgnoreCase
                )
            )
            {
                return user;
            }
        }

        return null;
    }


    // Add a new user by appending one JSON object
    // to the end of the file.
    public async Task<User> AddAsync(User user)
    {
        user.Id = Guid.NewGuid();

        user.CreatedAt = DateTime.UtcNow;

        var json =
            JsonSerializer.Serialize(
                user,
                _jsonOptions
            );

        await using var stream = new FileStream(
            _filePath,
            FileMode.Append,
            FileAccess.Write,
            FileShare.Read
        );

        await using var writer = new StreamWriter(stream);

        await writer.WriteLineAsync(json);

        return user;
    }


    // Update requires rewriting the file because
    // JSON Lines does not provide direct record updates.
    public async Task<User> UpdateAsync(User user)
    {
        var users = await ReadUsersAsync();

        var existingUser = users.FirstOrDefault(
            u => u.Id == user.Id
        );

        if (existingUser == null)
        {
            throw new KeyNotFoundException(
                "User not found."
            );
        }

        var index = users.IndexOf(existingUser);

        users[index] = user;

        await RewriteUsersAsync(users);

        return user;
    }


    // Delete also requires rewriting the file.
    public async Task<bool> DeleteAsync(Guid id)
    {
        var users = await ReadUsersAsync();

        var user = users.FirstOrDefault(
            u => u.Id == id
        );

        if (user == null)
        {
            return false;
        }

        users.Remove(user);

        await RewriteUsersAsync(users);

        return true;
    }


    // Used only for update/delete operations.
    private async Task RewriteUsersAsync(
        List<User> users)
    {
        await using var stream = new FileStream(
            _filePath,
            FileMode.Create,
            FileAccess.Write,
            FileShare.Read
        );

        await using var writer = new StreamWriter(stream);

        foreach (var user in users)
        {
            var json =
                JsonSerializer.Serialize(
                    user,
                    _jsonOptions
                );

            await writer.WriteLineAsync(json);
        }
    }
}