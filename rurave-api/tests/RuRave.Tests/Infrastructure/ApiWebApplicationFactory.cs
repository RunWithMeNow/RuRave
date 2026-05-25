using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using RuRave.Infrastructure.Persistence;

namespace RuRave.Tests.Infrastructure;

public class ApiWebApplicationFactory : WebApplicationFactory<Program>, IAsyncLifetime
{
    private readonly string _databaseName = $"RuRave_ApiTest_{Guid.NewGuid():N}";

    private string BuildConnectionString()
    {
        var configuration = new ConfigurationBuilder()
            .AddJsonFile("appsettings.test.json", optional: true)
            .AddEnvironmentVariables()
            .Build();

        var server = configuration["TestConnection:Server"] ?? "DESKTOP-G67DLTD";
        return $"Server={server};Database={_databaseName};Trusted_Connection=true;TrustServerCertificate=true;MultipleActiveResultSets=true";
    }

    public async Task InitializeAsync()
    {
        var connectionString = BuildConnectionString();
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseSqlServer(connectionString)
            .Options;

        await using var db = new AppDbContext(options);
        await db.Database.MigrateAsync();
        await TestDatabaseSeeder.SeedAsync(db);
    }

    private async Task CleanupDatabaseAsync()
    {
        var connectionString = BuildConnectionString();
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseSqlServer(connectionString)
            .Options;

        await using var db = new AppDbContext(options);
        await db.Database.EnsureDeletedAsync();
    }

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        var connectionString = BuildConnectionString();

        builder.ConfigureAppConfiguration((_, config) =>
        {
            config.AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["ConnectionStrings:DefaultConnection"] = connectionString
            });
        });

        builder.ConfigureServices(services =>
        {
            var descriptor = services.SingleOrDefault(
                d => d.ServiceType == typeof(DbContextOptions<AppDbContext>));

            if (descriptor is not null)
            {
                services.Remove(descriptor);
            }

            services.AddDbContext<AppDbContext>(options =>
                options.UseSqlServer(connectionString));
        });
    }

    Task IAsyncLifetime.DisposeAsync() => CleanupDatabaseAsync();
}
