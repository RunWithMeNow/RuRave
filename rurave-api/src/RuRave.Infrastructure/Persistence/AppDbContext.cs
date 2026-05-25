using Microsoft.EntityFrameworkCore;
using RuRave.Domain.Entities;

namespace RuRave.Infrastructure.Persistence;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<City> Cities => Set<City>();

    public DbSet<Venue> Venues => Set<Venue>();

    public DbSet<Artist> Artists => Set<Artist>();

    public DbSet<Concert> Concerts => Set<Concert>();

    public DbSet<ConcertArtist> ConcertArtists => Set<ConcertArtist>();

    public DbSet<TicketCategory> TicketCategories => Set<TicketCategory>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(AppDbContext).Assembly);
        base.OnModelCreating(modelBuilder);
    }
}
