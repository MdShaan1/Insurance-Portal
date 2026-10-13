using InsurancePolicyPortalDemo.Models;
namespace InsurancePolicyPortalDemo.Repositories;
public interface IPolicyHolderRepository
{
    Task<PolicyHolder?> GetByPolicyNumberAsync(
        string policyNumber,
        CancellationToken cancellationToken = default);
}