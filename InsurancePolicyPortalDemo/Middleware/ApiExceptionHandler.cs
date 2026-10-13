
using InsurancePolicyPortalDemo.Services;
using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Data.SqlClient;

namespace InsurancePolicyPortalDemo.Middleware;

internal sealed class ApiExceptionHandler(
    ILogger<ApiExceptionHandler> logger) : IExceptionHandler
{
    public async ValueTask<bool> TryHandleAsync(
        HttpContext httpContext,
        Exception exception,
        CancellationToken cancellationToken)
    {
        var statusCode = exception switch
        {
            PolicyholderValidationException =>
                StatusCodes.Status422UnprocessableEntity,

            RegistrationConflictException =>
                StatusCodes.Status409Conflict,

            DbUpdateException dbException
                when IsUniqueConstraintViolation(dbException) =>
                StatusCodes.Status409Conflict,

            DbUpdateException =>
                StatusCodes.Status503ServiceUnavailable,

            _ => StatusCodes.Status500InternalServerError
        };

        if (statusCode == StatusCodes.Status500InternalServerError)
        {
            logger.LogError(
                exception,
                "Unhandled API exception for {Path}",
                httpContext.Request.Path);
        }
        else
        {
            logger.LogWarning(
                exception,
                "Handled API exception with status {StatusCode}",
                statusCode);
        }

        var title = statusCode switch
        {
            StatusCodes.Status422UnprocessableEntity =>
                "Policyholder validation failed",

            StatusCodes.Status409Conflict =>
                "Registration conflict",

            StatusCodes.Status503ServiceUnavailable =>
                "Persistence error",

            _ => "An unexpected error occurred"
        };

        var detail = exception switch
        {
            PolicyholderValidationException =>
                "The policyholder details could not be verified.",

            RegistrationConflictException conflict =>
                conflict.Message,

            DbUpdateException dbException
                when IsUniqueConstraintViolation(dbException) =>
                "The username or policy number is already registered.",

            DbUpdateException =>
                "The registration could not be saved. Please try again.",

            _ => "An unexpected error occurred. Please try again."
        };

        var problem = new ProblemDetails
        {
            Status = statusCode,
            Title = title,
            Detail = detail,
            Instance = httpContext.Request.Path
        };

        if (exception is PolicyholderValidationException validationException)
        {
            problem.Extensions["errors"] = new Dictionary<string, string[]>
            {
                [validationException.Field] = [detail]
            };
        }
        else if (exception is RegistrationConflictException conflictException)
        {
            problem.Extensions["errors"] = new Dictionary<string, string[]>
            {
                [conflictException.Field] = [detail]
            };
        }

        httpContext.Response.StatusCode = statusCode;
        httpContext.Response.ContentType = "application/problem+json";

        await httpContext.Response.WriteAsJsonAsync(
            problem,
            cancellationToken);

        return true;
    }

    private static bool IsUniqueConstraintViolation(
        DbUpdateException exception)
    {
        var sqlException = exception.GetBaseException() as SqlException;

        return sqlException?.Number is 2601 or 2627;
    }
}
