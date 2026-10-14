
using InsurancePolicyPortalDemo.Data;
using InsurancePolicyPortalDemo.Models;
using Microsoft.EntityFrameworkCore;

namespace InsurancePolicyPortalDemo.Repositories;

public class SqlPolicyHolderRepository : IPolicyHolderRepository
{
    private readonly InsurancePolicyPortalDbContext _context;

    public SqlPolicyHolderRepository(InsurancePolicyPortalDbContext context)
    {
        _context = context;
    }

    public async Task<PolicyHolder?> GetByPolicyNumberAsync(string policyNumber, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(policyNumber)) return null;

        var normalizedPolicyNumber = policyNumber.Trim();
        var entity = await _context.PolicyHolders.AsNoTracking()
            .FirstOrDefaultAsync(p => p.PolicyNumber == normalizedPolicyNumber, cancellationToken);

        if (entity == null) return null;

        return new PolicyHolder
        {
            Id = entity.Id,
            SSN = entity.SSN,
            PolicyNumber = entity.PolicyNumber,
            FirstName = entity.FirstName,
            LastName = entity.LastName,
            DateOfBirth = entity.DateOfBirth,
            ZipCode = entity.ZipCode,
            Email = entity.Email,
            Phone = entity.Phone
        };
    }
}
