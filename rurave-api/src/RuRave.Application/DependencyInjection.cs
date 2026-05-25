using Microsoft.Extensions.DependencyInjection;

namespace RuRave.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        // Read service implementations are registered in Infrastructure.AddInfrastructure.
        return services;
    }
}
