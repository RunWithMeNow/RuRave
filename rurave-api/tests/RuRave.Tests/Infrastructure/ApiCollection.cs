namespace RuRave.Tests.Infrastructure;

[CollectionDefinition(Name)]
public class ApiCollection : ICollectionFixture<ApiWebApplicationFactory>
{
    public const string Name = "Api";
}
