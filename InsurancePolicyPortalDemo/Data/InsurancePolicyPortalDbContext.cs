using InsurancePolicyPortalDemo.Entities;
using Microsoft.EntityFrameworkCore;

namespace InsurancePolicyPortalDemo.Data;

public class InsurancePolicyPortalDbContext : DbContext
{
    public InsurancePolicyPortalDbContext(
        DbContextOptions<InsurancePolicyPortalDbContext> options)
        : base(options)
    {
    }

    public DbSet<PolicyHolderEntity> PolicyHolders
        => Set<PolicyHolderEntity>();

    public DbSet<UserEntity> Users
        => Set<UserEntity>();

    public DbSet<SecurityQuestionEntity> SecurityQuestions
        => Set<SecurityQuestionEntity>();

    protected override void OnModelCreating(
        ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<PolicyHolderEntity>()
            .HasKey(p => p.Id);

        modelBuilder.Entity<UserEntity>()
            .HasKey(u => u.Id);

        modelBuilder.Entity<SecurityQuestionEntity>()
            .HasKey(q => q.Id);

        modelBuilder.Entity<UserEntity>()
            .HasMany(u => u.SecurityQuestions)
            .WithOne(q => q.User)
            .HasForeignKey(q => q.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<PolicyHolderEntity>()
            .HasIndex(p => p.PolicyNumber)
            .IsUnique();

        modelBuilder.Entity<UserEntity>()
            .HasIndex(u => u.Username)
            .IsUnique();

        modelBuilder.Entity<UserEntity>()
            .HasIndex(u => u.PolicyNumber)
            .IsUnique();
    }
}