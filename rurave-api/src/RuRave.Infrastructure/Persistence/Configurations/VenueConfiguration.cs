using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using RuRave.Domain.Entities;

namespace RuRave.Infrastructure.Persistence.Configurations;

public class VenueConfiguration : IEntityTypeConfiguration<Venue>
{
    public void Configure(EntityTypeBuilder<Venue> builder)
    {
        builder.ToTable("Venues");

        builder.HasKey(v => v.Id);

        builder.Property(v => v.Name)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(v => v.Address)
            .HasMaxLength(500);

        builder.HasIndex(v => v.CityId);

        builder.HasOne(v => v.City)
            .WithMany(c => c.Venues)
            .HasForeignKey(v => v.CityId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
