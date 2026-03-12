using HotelBookingPlatform.Core.Entities;
using HotelBookingPlatform.Core.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

namespace HotelBookingPlatform.Infrastructure.Data;

public static class SeedData
{
    public static async Task InitializeAsync(IServiceProvider serviceProvider)
    {
        using var context = new ApplicationDbContext(
            serviceProvider.GetRequiredService<DbContextOptions<ApplicationDbContext>>());

        // Seed default admin account if none exists
        if (!context.Users.Any(u => u.Role == UserRole.Admin))
        {
            // Simple BCrypt-compatible hash for "Admin@123"
            var adminUser = new User
            {
                Email = "admin@hotelbooking.com",
                FirstName = "Admin",
                LastName = "System",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin@123"),
                Role = UserRole.Admin,
                CreatedAt = DateTime.UtcNow,
                IsEmailVerified = true
            };
            context.Users.Add(adminUser);
            await context.SaveChangesAsync();
        }

        // Check if there's already hotel data
        if (context.Hotels.Any())
        {
            return; // Database already seeded
        }

        // Add amenities first
        var wifi = new Amenity { Name = "Free WiFi", Description = "High-speed internet", IconUrl = "wifi-icon" };
        var pool = new Amenity { Name = "Swimming Pool", Description = "Outdoor pool", IconUrl = "pool-icon" };
        var parking = new Amenity { Name = "Free Parking", Description = "On-site parking", IconUrl = "parking-icon" };
        var breakfast = new Amenity { Name = "Breakfast Included", Description = "Complimentary breakfast", IconUrl = "breakfast-icon" };
        var gym = new Amenity { Name = "Fitness Center", Description = "24/7 gym access", IconUrl = "gym-icon" };
        var spa = new Amenity { Name = "Spa", Description = "Full-service spa", IconUrl = "spa-icon" };

        context.Amenities.AddRange(wifi, pool, parking, breakfast, gym, spa);
        await context.SaveChangesAsync();

        // Add hotels
        var grandHotel = new Hotel
        {
            Name = "Grand Plaza Hotel",
            Description = "Luxury hotel in the heart of the city with stunning views",
            Address = "123 Main Street",
            City = "New York",
            Country = "USA",
            StarRating = 5,
            MainImageUrl = "https://example.com/grand-plaza.jpg",
            PhoneNumber = "+1-212-555-1234",
            Email = "info@grandplaza.com",
            Website = "www.grandplaza.com",
            CheckInTime = "15:00",
            CheckOutTime = "11:00",
            Amenities = new List<Amenity> { wifi, pool, gym, spa }
        };

        var beachResort = new Hotel
        {
            Name = "Sunset Beach Resort",
            Description = "Beautiful beachfront resort with private access to the beach",
            Address = "456 Ocean Drive",
            City = "Miami",
            Country = "USA",
            StarRating = 4,
            MainImageUrl = "https://example.com/sunset-resort.jpg",
            PhoneNumber = "+1-305-555-5678",
            Email = "reservations@sunsetbeach.com",
            Website = "www.sunsetbeachresort.com",
            CheckInTime = "16:00",
            CheckOutTime = "10:00",
            Amenities = new List<Amenity> { wifi, pool, parking, breakfast }
        };

        var mountainLodge = new Hotel
        {
            Name = "Mountain View Lodge",
            Description = "Cozy lodge with breathtaking mountain views",
            Address = "789 Pine Road",
            City = "Denver",
            Country = "USA",
            StarRating = 3,
            MainImageUrl = "https://example.com/mountain-lodge.jpg",
            PhoneNumber = "+1-303-555-9012",
            Email = "info@mountainviewlodge.com",
            Website = "www.mountainviewlodge.com",
            CheckInTime = "14:00",
            CheckOutTime = "12:00",
            Amenities = new List<Amenity> { wifi, parking }
        };

        context.Hotels.AddRange(grandHotel, beachResort, mountainLodge);
        await context.SaveChangesAsync();

        // Add rooms for Grand Plaza
        var grandRooms = new List<Room>
        {
            new Room
            {
                RoomNumber = "101",
                RoomType = "Deluxe King",
                Description = "Spacious room with king bed and city view",
                PricePerNight = 299.99m,
                Capacity = 2,
                BedCount = 1,
                BedType = "King",
                SizeInSquareMeters = 35,
                IsSmokingAllowed = false,
                Status = RoomStatus.Available,
                HotelId = grandHotel.Id,
                ThumbnailUrl = "https://example.com/room101.jpg",
                RoomAmenities = new List<RoomAmenity>
                {
                    new RoomAmenity { Name = "Air Conditioning" },
                    new RoomAmenity { Name = "Flat-screen TV" },
                    new RoomAmenity { Name = "Mini Bar" }
                }
            },
            new Room
            {
                RoomNumber = "102",
                RoomType = "Executive Suite",
                Description = "Luxury suite with separate living area",
                PricePerNight = 499.99m,
                Capacity = 4,
                BedCount = 2,
                BedType = "Queen",
                SizeInSquareMeters = 55,
                IsSmokingAllowed = false,
                Status = RoomStatus.Available,
                HotelId = grandHotel.Id,
                ThumbnailUrl = "https://example.com/suite102.jpg",
                RoomAmenities = new List<RoomAmenity>
                {
                    new RoomAmenity { Name = "Air Conditioning" },
                    new RoomAmenity { Name = "Flat-screen TV" },
                    new RoomAmenity { Name = "Mini Bar" },
                    new RoomAmenity { Name = "Jacuzzi" }
                }
            }
        };

        // Add rooms for Beach Resort
        var beachRooms = new List<Room>
        {
            new Room
            {
                RoomNumber = "B201",
                RoomType = "Ocean View Double",
                Description = "Room with balcony overlooking the ocean",
                PricePerNight = 199.99m,
                Capacity = 2,
                BedCount = 1,
                BedType = "Queen",
                SizeInSquareMeters = 30,
                IsSmokingAllowed = false,
                Status = RoomStatus.Available,
                HotelId = beachResort.Id,
                ThumbnailUrl = "https://example.com/beach201.jpg",
                RoomAmenities = new List<RoomAmenity>
                {
                    new RoomAmenity { Name = "Air Conditioning" },
                    new RoomAmenity { Name = "Flat-screen TV" },
                    new RoomAmenity { Name = "Coffee Maker" }
                }
            }
        };

        // Add rooms for Mountain Lodge
        var mountainRooms = new List<Room>
        {
            new Room
            {
                RoomNumber = "M301",
                RoomType = "Standard Room",
                Description = "Cozy room with mountain view",
                PricePerNight = 89.99m,
                Capacity = 2,
                BedCount = 1,
                BedType = "Queen",
                SizeInSquareMeters = 25,
                IsSmokingAllowed = true,
                Status = RoomStatus.Available,
                HotelId = mountainLodge.Id,
                ThumbnailUrl = "https://example.com/mountain301.jpg",
                RoomAmenities = new List<RoomAmenity>
                {
                    new RoomAmenity { Name = "Heating" },
                    new RoomAmenity { Name = "TV" }
                }
            }
        };

        context.Rooms.AddRange(grandRooms);
        context.Rooms.AddRange(beachRooms);
        context.Rooms.AddRange(mountainRooms);
        await context.SaveChangesAsync();
    }
}