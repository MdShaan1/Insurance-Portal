using System.Text.Json;
using InsurancePolicyPortalDemo.Models;

namespace InsurancePolicyPortalDemo.Repositories;

public class PolicyHolderRepository : IPolicyHolderRepository
{
    private readonly string _filePath;

    private readonly JsonSerializerOptions _jsonOptions =
        new()
        {
            PropertyNameCaseInsensitive = true
        };

    public PolicyHolderRepository(IWebHostEnvironment environment)
    {
        _filePath = Path.Combine(
            environment.ContentRootPath,
            "Data",
            "policyholders.json"
        );
    }

    public async Task<PolicyHolder?> GetByPolicyNumberAsync(
        string policyNumber)
    {
        if (!File.Exists(_filePath))
        {
            return null;
        }

        var json = await File.ReadAllTextAsync(_filePath);

        if (string.IsNullOrWhiteSpace(json))
        {
            return null;
        }

        var data =
            JsonSerializer.Deserialize<PolicyHolderData>(
                json,
                _jsonOptions
            );

        return data?.Policies.FirstOrDefault(
            p => p.PolicyNumber.Equals(
                policyNumber,
                StringComparison.OrdinalIgnoreCase
            )
        );
    }

    private class PolicyHolderData
    {
        public List<PolicyHolder> Policies { get; set; } = new();
    }
}