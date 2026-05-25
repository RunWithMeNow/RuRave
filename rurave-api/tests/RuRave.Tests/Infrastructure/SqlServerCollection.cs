namespace RuRave.Tests.Infrastructure;

[CollectionDefinition(Name)]
public class SqlServerCollection : ICollectionFixture<SqlServerTestFixture>
{
    public const string Name = "SqlServer";
}
