
using System.Collections.Concurrent;
using System.Text.Json;
using InsurancePolicyPortalDemo.Models;
using InsurancePolicyPortalDemo.Services;

namespace InsurancePolicyPortalDemo.Repositories;

public sealed class UserRepository : IUserRepository
{
    private static readonly ConcurrentDictionary<string, SemaphoreSlim> FileLocks = new(StringComparer.OrdinalIgnoreCase);
    private readonly string _filePath;
    private readonly SemaphoreSlim _fileLock;
    private readonly JsonSerializerOptions _jsonOptions = new() { PropertyNameCaseInsensitive = true };

    public UserRepository(IWebHostEnvironment environment)
    {
        _filePath = Path.Combine(environment.ContentRootPath, "Data", "users.json");
        _fileLock = FileLocks.GetOrAdd(_filePath, static _ => new SemaphoreSlim(1, 1));
    }

    public async Task<List<User>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        await _fileLock.WaitAsync(cancellationToken);
        try { return await ReadUsersAsync(cancellationToken); }
        finally { _fileLock.Release(); }
    }

    public async Task<User?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var users = await GetAllAsync(cancellationToken);
        return users.FirstOrDefault(user => user.Id == id);
    }

    public async Task<User?> GetByUsernameAsync(string username, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(username)) return null;
        var users = await GetAllAsync(cancellationToken);
        return users.FirstOrDefault(user => user.Username.Equals(username.Trim(), StringComparison.OrdinalIgnoreCase));
    }

    public async Task<User?> GetByPolicyNumberAsync(string policyNumber, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(policyNumber)) return null;
        var users = await GetAllAsync(cancellationToken);
        return users.FirstOrDefault(user => user.PolicyNumber.Equals(policyNumber.Trim(), StringComparison.OrdinalIgnoreCase));
    }

    public async Task<User> AddAsync(User user, CancellationToken cancellationToken = default)
    {
        ArgumentNullException.ThrowIfNull(user);
        await _fileLock.WaitAsync(cancellationToken);
        try
        {
            var existingUsers = await ReadUsersAsync(cancellationToken);
            if (existingUsers.Any(existing => existing.Username.Equals(user.Username, StringComparison.OrdinalIgnoreCase)))
                throw new RegistrationConflictException("accountInformation.username", "Username already exists.");

            if (existingUsers.Any(existing => existing.PolicyNumber.Equals(user.PolicyNumber, StringComparison.OrdinalIgnoreCase)))
                throw new RegistrationConflictException("personalInformation.policyNumber", "An account has already been created for this policy number.");

            user.Id = Guid.NewGuid();
            user.CreatedAt = DateTime.UtcNow;
            Directory.CreateDirectory(Path.GetDirectoryName(_filePath)!);

            await using var stream = new FileStream(_filePath, FileMode.Append, FileAccess.Write, FileShare.Read, bufferSize: 4096, useAsync: true);
            await using var writer = new StreamWriter(stream);
            await writer.WriteLineAsync(JsonSerializer.Serialize(user, _jsonOptions).AsMemory(), cancellationToken);
            return user;
        }
        finally { _fileLock.Release(); }
    }

    public async Task<User> UpdateAsync(User user, CancellationToken cancellationToken = default)
    {
        ArgumentNullException.ThrowIfNull(user);
        await _fileLock.WaitAsync(cancellationToken);
        try
        {
            var users = await ReadUsersAsync(cancellationToken);
            var index = users.FindIndex(existing => existing.Id == user.Id);
            if (index < 0) throw new KeyNotFoundException("User not found.");

            users[index] = user;
            await RewriteUsersAsync(users, cancellationToken);
            return user;
        }
        finally { _fileLock.Release(); }
    }

    public async Task<bool> DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        await _fileLock.WaitAsync(cancellationToken);
        try
        {
            var users = await ReadUsersAsync(cancellationToken);
            var user = users.FirstOrDefault(existing => existing.Id == id);
            if (user is null) return false;

            users.Remove(user);
            await RewriteUsersAsync(users, cancellationToken);
            return true;
        }
        finally { _fileLock.Release(); }
    }

    private async Task<List<User>> ReadUsersAsync(CancellationToken cancellationToken)
    {
        var users = new List<User>();
        if (!File.Exists(_filePath)) return users;

        await using var stream = new FileStream(_filePath, FileMode.Open, FileAccess.Read, FileShare.Read, bufferSize: 4096, useAsync: true);
        using var reader = new StreamReader(stream);
        while (await reader.ReadLineAsync(cancellationToken) is { } line)
        {
            if (string.IsNullOrWhiteSpace(line)) continue;
            var user = JsonSerializer.Deserialize<User>(line, _jsonOptions);
            if (user is not null) users.Add(user);
        }

        return users;
    }

    private async Task RewriteUsersAsync(List<User> users, CancellationToken cancellationToken)
    {
        Directory.CreateDirectory(Path.GetDirectoryName(_filePath)!);
        var temporaryPath = _filePath + ".tmp";

        await using (var stream = new FileStream(temporaryPath, FileMode.Create, FileAccess.Write, FileShare.None, bufferSize: 4096, useAsync: true))
        await using (var writer = new StreamWriter(stream))
        {
            foreach (var user in users)
                await writer.WriteLineAsync(JsonSerializer.Serialize(user, _jsonOptions).AsMemory(), cancellationToken);
        }

        File.Move(temporaryPath, _filePath, overwrite: true);
    }
}
