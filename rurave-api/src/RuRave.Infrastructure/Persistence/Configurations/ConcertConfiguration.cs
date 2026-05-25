using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using RuRave.Domain.Entities;

namespace RuRave.Infrastructure.Persistence.Configurations;

public class ConcertConfiguration : IEntityTypeConfiguration<Concert>
{
    public void Configure(EntityTypeBuilder<Concert> builder)
    {
        builder.ToTable("Concerts");

        builder.HasKey(c => c.Id);

        builder.Property(c => c.Title)
            .IsRequired()
            .HasMaxLength(300);

        builder.Property(c => c.Slug)
            .IsRequired()
            .HasMaxLength(300);

        builder.HasIndex(c => c.Slug)
            .IsUnique();

        builder.Property(c => c.ImageUrl)
            .IsRequired()
            .HasMaxLength(1000);

        builder.HasIndex(c => new { c.Status, c.StartsAt });

        builder.HasOne(c => c.Venue)
            .WithMany(v => v.Concerts)
            .HasForeignKey(c => c.VenueId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
