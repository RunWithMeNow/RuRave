using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using RuRave.Application.Cities;
using RuRave.Application.Concerts;
using RuRave.Application.Venues;
using RuRave.Infrastructure.Persistence;
using RuRave.Infrastructure.ReadServices;

namespace RuRave.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        services.AddDbContext<AppDbContext>(options =>
            options.UseSqlServer(configuration.GetConnectionString("DefaultConnection")));

        services.AddScoped<ICityReadService, CityReadService>();
        services.AddScoped<IConcertReadService, ConcertReadService>();
        services.AddScoped<IVenueReadService, VenueReadService>();

        return services;
    }
}
