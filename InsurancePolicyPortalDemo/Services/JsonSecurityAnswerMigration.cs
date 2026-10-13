using InsurancePolicyPortalDemo.Models;
using InsurancePolicyPortalDemo.Repositories;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Hosting;

namespace InsurancePolicyPortalDemo.Services;

public sealed class JsonSecurityAnswerMigration(
    IServiceScopeFactory serviceScopeFactory,
    ILogger<JsonSecurityAnswerMigration> logger) : IHostedService
{
    public async Task StartAsync(CancellationToken cancellationToken)
    {
        await using var scope = serviceScopeFactory.CreateAsyncScope();
        var userRepository = scope.ServiceProvider.GetRequiredService<IUserRepository>();
        var passwordHasher = scope.ServiceProvider.GetRequiredService<IPasswordHasher<User>>();
        var users = await userRepository.GetAllAsync(cancellationToken);
        var migratedCount = 0;

        foreach (var user in users)
        {
            var changed = false;
            foreach (var securityQuestion in user.SecurityQuestions)
            {
                if (securityQuestion.Answer.StartsWith("AQAAAA", StringComparison.Ordinal))
                {
                    continue;
                }

                securityQuestion.Answer = passwordHasher.HashPassword(user, securityQuestion.Answer);
                changed = true;
            }

            if (changed)
            {
                await userRepository.UpdateAsync(user, cancellationToken);
                migratedCount++;
            }
        }

        if (migratedCount > 0)
        {
            logger.LogInformation(
                "Rehashed legacy security answers for {UserCount} JSON-backed accounts.",
                migratedCount);
        }
    }

    public Task StopAsync(CancellationToken cancellationToken) => Task.CompletedTask;
}
