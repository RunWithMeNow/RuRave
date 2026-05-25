using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Mvc;
using RuRave.Application.Exceptions;

namespace RuRave.Api.Infrastructure;

public class ApiExceptionHandler(ILogger<ApiExceptionHandler> logger) : IExceptionHandler
{
    public async ValueTask<bool> TryHandleAsync(
        HttpContext httpContext,
        Exception exception,
        CancellationToken cancellationToken)
    {
        var (statusCode, title, detail) = exception switch
        {
            CityNotFoundException cityNotFound => (
                StatusCodes.Status404NotFound,
                "City not found",
                cityNotFound.Message),
            InvalidQueryException invalidQuery => (
                StatusCodes.Status400BadRequest,
                "Invalid query",
                invalidQuery.Message),
            _ => (0, "", "")
        };

        if (statusCode == 0)
        {
            logger.LogError(
                exception,
                "Unhandled exception for {Method} {Path}",
                httpContext.Request.Method,
                httpContext.Request.Path);
            return false;
        }

        logger.LogWarning(
            "API error {StatusCode} for {Method} {Path}: {Detail}",
            statusCode,
            httpContext.Request.Method,
            httpContext.Request.Path,
            detail);

        var problemDetails = new ProblemDetails
        {
            Status = statusCode,
            Title = title,
            Detail = detail,
            Instance = httpContext.Request.Path
        };

        httpContext.Response.StatusCode = statusCode;
        await httpContext.Response.WriteAsJsonAsync(problemDetails, cancellationToken);

        return true;
    }
}
