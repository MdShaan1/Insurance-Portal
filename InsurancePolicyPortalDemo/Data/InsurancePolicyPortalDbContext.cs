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
        modelBuilder.Entity<PolicyHolderEntity>()
            .Property(p => p.SSN)
            .HasMaxLength(4);
        modelBuilder.Entity<PolicyHolderEntity>()
            .Property(p => p.PolicyNumber)
            .HasMaxLength(12);
        modelBuilder.Entity<PolicyHolderEntity>()
            .Property(p => p.FirstName)
            .HasMaxLength(50);
        modelBuilder.Entity<PolicyHolderEntity>()
            .Property(p => p.LastName)
            .HasMaxLength(50);
        modelBuilder.Entity<PolicyHolderEntity>()
            .Property(p => p.DateOfBirth)
            .HasMaxLength(10);
        modelBuilder.Entity<PolicyHolderEntity>()
            .Property(p => p.ZipCode)
            .HasMaxLength(6);
        modelBuilder.Entity<PolicyHolderEntity>()
            .Property(p => p.Email)
            .HasMaxLength(254);
        modelBuilder.Entity<PolicyHolderEntity>()
            .Property(p => p.Phone)
            .HasMaxLength(10);

        modelBuilder.Entity<UserEntity>()
            .HasKey(u => u.Id);
        modelBuilder.Entity<UserEntity>()
            .Property(u => u.FirstName)
            .HasMaxLength(50);
        modelBuilder.Entity<UserEntity>()
            .Property(u => u.LastName)
            .HasMaxLength(50);
        modelBuilder.Entity<UserEntity>()
            .Property(u => u.DateOfBirth)
            .HasMaxLength(10);
        modelBuilder.Entity<UserEntity>()
            .Property(u => u.ZipCode)
            .HasMaxLength(6);

        modelBuilder.Entity<SecurityQuestionEntity>()
            .HasKey(q => q.Id);
        modelBuilder.Entity<SecurityQuestionEntity>()
            .Property(q => q.Question)
            .HasMaxLength(150);
        modelBuilder.Entity<SecurityQuestionEntity>()
            .Property(q => q.Answer)
            .HasMaxLength(512);

        modelBuilder.Entity<UserEntity>()
            .Property(u => u.PolicyNumber)
            .HasMaxLength(12);
        modelBuilder.Entity<UserEntity>()
            .Property(u => u.Username)
            .HasMaxLength(30);
        modelBuilder.Entity<UserEntity>()
            .Property(u => u.PasswordHash)
            .HasMaxLength(512);
        modelBuilder.Entity<UserEntity>()
            .Property(u => u.Email)
            .HasMaxLength(254);
        modelBuilder.Entity<UserEntity>()
            .Property(u => u.Phone)
            .HasMaxLength(10);
        modelBuilder.Entity<UserEntity>()
            .Property(u => u.StreetAddress)
            .HasMaxLength(200);
        modelBuilder.Entity<UserEntity>()
            .Property(u => u.StreetAddressLine2)
            .HasMaxLength(100);
        modelBuilder.Entity<UserEntity>()
            .Property(u => u.City)
            .HasMaxLength(60);
        modelBuilder.Entity<UserEntity>()
            .Property(u => u.State)
            .HasMaxLength(60);
        modelBuilder.Entity<UserEntity>()
            .Property(u => u.Country)
            .HasMaxLength(60);

        modelBuilder.Entity<UserEntity>()
            .HasMany(u => u.SecurityQuestions)
            .WithOne(q => q.User)
            .HasForeignKey(q => q.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<UserEntity>()
            .HasOne(u => u.PolicyHolder)
            .WithOne(p => p.User)
            .HasForeignKey<UserEntity>(u => u.PolicyHolderId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<PolicyHolderEntity>()
            .HasIndex(p => p.PolicyNumber)
            .IsUnique();

        modelBuilder.Entity<UserEntity>()
            .HasIndex(u => u.Username)
            .IsUnique();

        modelBuilder.Entity<UserEntity>()
            .HasIndex(u => u.PolicyNumber)
            .IsUnique();
        modelBuilder.Entity<UserEntity>()
            .HasIndex(u => u.PolicyHolderId)
            .IsUnique()
            .HasFilter("[PolicyHolderId] IS NOT NULL");
    }
}