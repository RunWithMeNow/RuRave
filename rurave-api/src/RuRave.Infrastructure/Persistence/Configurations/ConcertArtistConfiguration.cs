using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using RuRave.Domain.Entities;

namespace RuRave.Infrastructure.Persistence.Configurations;

public class ConcertArtistConfiguration : IEntityTypeConfiguration<ConcertArtist>
{
    public void Configure(EntityTypeBuilder<ConcertArtist> builder)
    {
        builder.ToTable("ConcertArtists");

        builder.HasKey(ca => new { ca.ConcertId, ca.ArtistId });

        builder.Property(ca => ca.DisplayOrder)
            .HasDefaultValue(0);

        builder.Property(ca => ca.IsHeadliner)
            .HasDefaultValue(false);

        builder.HasIndex(ca => ca.ArtistId);

        builder.HasOne(ca => ca.Concert)
            .WithMany(c => c.ConcertArtists)
            .HasForeignKey(ca => ca.ConcertId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(ca => ca.Artist)
            .WithMany(a => a.ConcertArtists)
            .HasForeignKey(ca => ca.ArtistId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
