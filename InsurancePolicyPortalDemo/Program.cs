using System.Text.Json.Serialization;
using InsurancePolicyPortalDemo.Data;
using InsurancePolicyPortalDemo.Middleware;
using InsurancePolicyPortalDemo.Models;
using InsurancePolicyPortalDemo.Repositories;
using InsurancePolicyPortalDemo.Services;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers()
    .AddJsonOptions(options =>
        options.JsonSerializerOptions.Converters.Add(
            new JsonStringEnumConverter()));

builder.Services.AddProblemDetails();
builder.Services.AddExceptionHandler<ApiExceptionHandler>();

builder.Services.AddAuthentication(
        CookieAuthenticationDefaults.AuthenticationScheme)
    .AddCookie(options =>
    {
        options.Cookie.Name = "InsurancePortal.Auth";
        options.Cookie.HttpOnly = true;
        options.Cookie.SameSite = SameSiteMode.Strict;
        options.Cookie.SecurePolicy = builder.Environment.IsDevelopment()
            ? CookieSecurePolicy.SameAsRequest
            : CookieSecurePolicy.Always;

        options.LoginPath = "/api/users/login";
        options.AccessDeniedPath = "/api/users/access-denied";
        options.ExpireTimeSpan = TimeSpan.FromHours(2);
        options.SlidingExpiration = true;

        options.Events.OnRedirectToLogin = context =>
        {
            context.Response.StatusCode =
                StatusCodes.Status401Unauthorized;
            context.Response.ContentType = "application/problem+json";

            return context.Response.WriteAsJsonAsync(
                new Microsoft.AspNetCore.Mvc.ProblemDetails
                {
                    Status = StatusCodes.Status401Unauthorized,
                    Title = "Authentication required",
                    Detail = "Sign in to access this resource.",
                    Instance = context.Request.Path
                });
        };

        options.Events.OnRedirectToAccessDenied = context =>
        {
            context.Response.StatusCode =
                StatusCodes.Status403Forbidden;
            context.Response.ContentType = "application/problem+json";

            return context.Response.WriteAsJsonAsync(
                new Microsoft.AspNetCore.Mvc.ProblemDetails
                {
                    Status = StatusCodes.Status403Forbidden,
                    Title = "Access denied",
                    Detail = "You are not authorized to access this resource.",
                    Instance = context.Request.Path
                });
        };
    });

builder.Services.AddAuthorization();

builder.Services.AddScoped<IPasswordHasher<User>, PasswordHasher<User>>();

builder.Services.AddOptions<SecurityQuestionOptions>()
    .BindConfiguration(SecurityQuestionOptions.SectionName)
    .ValidateDataAnnotations()
    .ValidateOnStart();

var connectionString =
    builder.Configuration.GetConnectionString("DefaultConnection");

if (string.IsNullOrWhiteSpace(connectionString))
{
    throw new InvalidOperationException(
        "Database connection string 'DefaultConnection' is required. " +
        "Configure it with .NET user secrets or the " +
        "ConnectionStrings__DefaultConnection environment variable.");
}

builder.Services.AddDbContext<InsurancePolicyPortalDbContext>(
    options => options.UseSqlServer(connectionString));

builder.Services.AddScoped<IUserRepository, SqlUserRepository>();
builder.Services.AddScoped<IPolicyHolderRepository, SqlPolicyHolderRepository>();
builder.Services.AddScoped<IUserService, UserService>();

builder.Services.AddCors(options =>
{
    options.AddPolicy("NextJsPolicy", policy =>
    {
        policy
            .WithOrigins("http://localhost:3000")
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials();
    });
});

builder.Services.AddEndpointsApiExplorer();

if (builder.Environment.IsDevelopment())
{
    builder.Services.AddSwaggerGen();
}

var app = builder.Build();

// TEMPORARY DATABASE DIAGNOSTICS
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider
        .GetRequiredService<InsurancePolicyPortalDbContext>();

    Console.WriteLine(
        $"Connected database: {db.Database.GetDbConnection().Database}");

    Console.WriteLine(
        $"Connected server: {db.Database.GetDbConnection().DataSource}");

    var columnExists = await db.Database
        .SqlQueryRaw<int>(
            """
            SELECT CASE
                WHEN COL_LENGTH('dbo.Users', 'PolicyHolderId') IS NULL
                THEN 0
                ELSE 1
            END AS [Value]
            """)
        .SingleAsync();

    Console.WriteLine(
        $"PolicyHolderId visible to API connection: {columnExists}");
}

app.UseExceptionHandler();
app.UseStatusCodePages();

app.UseCors("NextJsPolicy");

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseAuthentication();
app.UseAuthorization();

if (app.Environment.IsDevelopment())
{
    app.MapGet("/", () => Results.Redirect("/swagger"));
}
else
{
    app.MapGet("/", () =>
        Results.Ok(new
        {
            message = "Insurance Policy Portal API is running."
        }));
}

app.MapControllers();

app.Run();