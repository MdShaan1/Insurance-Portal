using InsurancePolicyPortalDemo.Data;
using InsurancePolicyPortalDemo.Repositories;
using InsurancePolicyPortalDemo.Services;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// Controllers
builder.Services.AddControllers();

// Swagger
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// SQL Server + Entity Framework Core
builder.Services.AddDbContext<InsurancePolicyPortalDbContext>(
    options =>
        options.UseSqlServer(
            builder.Configuration
                .GetConnectionString("DefaultConnection")
        )
);

// SQL Repository implementations
builder.Services.AddScoped<
    IUserRepository,
    SqlUserRepository
>();

builder.Services.AddScoped<
    IPolicyHolderRepository,
    SqlPolicyHolderRepository
>();

// Service
builder.Services.AddScoped<
    IUserService,
    UserService
>();

// CORS - Allow Next.js frontend
builder.Services.AddCors(options =>
{
    options.AddPolicy("NextJsPolicy", policy =>
    {
        policy
            .WithOrigins("http://localhost:3000")
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

var app = builder.Build();

// CORS
app.UseCors("NextJsPolicy");

app.UseSwagger();
app.UseSwaggerUI();

app.UseAuthorization();

app.MapControllers();

app.Run();