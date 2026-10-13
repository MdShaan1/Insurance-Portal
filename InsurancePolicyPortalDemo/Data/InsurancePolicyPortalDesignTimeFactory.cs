using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using Microsoft.Extensions.Configuration;

namespace InsurancePolicyPortalDemo.Data;

public sealed class InsurancePolicyPortalDesignTimeFactory
    : IDesignTimeDbContextFactory<InsurancePolicyPortalDbContext>
{
    public InsurancePolicyPortalDbContext CreateDbContext(string[] args)
    {
        var configuration = new ConfigurationBuilder()
            .AddUserSecrets<InsurancePolicyPortalDesignTimeFactory>(optional: true)
            .AddEnvironmentVariables()
            .Build();
        var connectionString = configuration.GetConnectionString("DefaultConnection");

        if (string.IsNullOrWhiteSpace(connectionString))
        {
            throw new InvalidOperationException(
                "Database connection string 'DefaultConnection' is required. " +
                "Configure it with .NET user secrets or the ConnectionStrings__DefaultConnection environment variable."
            );
        }

        var options = new DbContextOptionsBuilder<InsurancePolicyPortalDbContext>()
            .UseSqlServer(connectionString)
            .Options;

        return new InsurancePolicyPortalDbContext(options);
    }
}
