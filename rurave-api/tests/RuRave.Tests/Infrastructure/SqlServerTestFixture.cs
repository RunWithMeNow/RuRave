using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using RuRave.Infrastructure;
using RuRave.Infrastructure.Persistence;

namespace RuRave.Tests.Infrastructure;

public class SqlServerTestFixture : IAsyncLifetime
{
    private readonly string _databaseName = $"RuRave_Test_{Guid.NewGuid():N}";
    private ServiceProvider? _serviceProvider;

    public IServiceProvider Services => _serviceProvider
        ?? throw new InvalidOperationException("Fixture not initialized.");

    public async Task InitializeAsync()
    {
        var configuration = new ConfigurationBuilder()
            .AddJsonFile("appsettings.test.json", optional: true)
            .AddEnvironmentVariables()
            .Build();

        var server = configuration["TestConnection:Server"] ?? "DESKTOP-G67DLTD";
        var connectionString =
            $"Server={server};Database={_databaseName};Trusted_Connection=true;TrustServerCertificate=true;MultipleActiveResultSets=true";

        var services = new ServiceCollection();
        var configDict = new Dictionary<string, string?>
        {
            ["ConnectionStrings:DefaultConnection"] = connectionString
        };
        var testConfiguration = new ConfigurationBuilder()
            .AddInMemoryCollection(configDict)
            .Build();

        services.AddInfrastructure(testConfiguration);

        _serviceProvider = services.BuildServiceProvider();

        await using var scope = _serviceProvider.CreateAsyncScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        await db.Database.MigrateAsync();
        await TestDatabaseSeeder.SeedAsync(db);
    }

    public async Task DisposeAsync()
    {
        if (_serviceProvider is not null)
        {
            await using var scope = _serviceProvider.CreateAsyncScope();
            var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
            await db.Database.EnsureDeletedAsync();
            await _serviceProvider.DisposeAsync();
        }
    }
}
