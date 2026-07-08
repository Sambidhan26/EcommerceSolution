using System.Net;
using System.Text.Json;
using Ecommerce.API.Common;
using Ecommerce.API.Common.Exceptions;

namespace Ecommerce.API.Middleware
{
    public class ExceptionHandlingMiddleware
    {
            private readonly RequestDelegate _next;
            private readonly ILogger<ExceptionHandlingMiddleware> _logger;

            public ExceptionHandlingMiddleware(
                RequestDelegate next,
                ILogger<ExceptionHandlingMiddleware> logger)
            {
                _next = next;
                _logger = logger;
            }

            public async Task InvokeAsync(HttpContext context)
            {
                try
                {
                    await _next(context);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, ex.Message);

                    context.Response.ContentType = "application/json";

                    var statusCode = ex switch
                    {
                        InvalidOperationException => (int)HttpStatusCode.BadRequest,
                        UnauthorizedAccessException => (int)HttpStatusCode.Forbidden,
                        KeyNotFoundException => (int)HttpStatusCode.NotFound,
                        _ => (int)HttpStatusCode.InternalServerError
                    };

                    context.Response.StatusCode = statusCode;

                    var response = new
                    {
                        statusCode,
                        message = ex is InvalidOperationException
                            or UnauthorizedAccessException
                            or KeyNotFoundException
                                ? ex.Message
                                : "An unexpected error occurred.",
                        traceId = context.TraceIdentifier
                    };

                    var json = JsonSerializer.Serialize(response);

                    await context.Response.WriteAsync(json);
                }
            }
        }
    
}
