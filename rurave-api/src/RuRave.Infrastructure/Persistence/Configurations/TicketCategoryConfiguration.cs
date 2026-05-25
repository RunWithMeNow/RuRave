using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using RuRave.Domain.Entities;

namespace RuRave.Infrastructure.Persistence.Configurations;

public class TicketCategoryConfiguration : IEntityTypeConfiguration<TicketCategory>
{
    public void Configure(EntityTypeBuilder<TicketCategory> builder)
    {
        builder.ToTable("TicketCategories");

        builder.HasKey(t => t.Id);

        builder.Property(t => t.Name)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(t => t.Price)
            .HasPrecision(18, 2);

        builder.Property(t => t.IsActive)
            .HasDefaultValue(true);

        builder.HasIndex(t => t.ConcertId);

        builder.HasOne(t => t.Concert)
            .WithMany(c => c.TicketCategories)
            .HasForeignKey(t => t.ConcertId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
