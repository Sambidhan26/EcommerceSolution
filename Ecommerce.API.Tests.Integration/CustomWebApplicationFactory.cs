using Ecommerce.API.Data;
using Ecommerce.API.Models;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;

namespace Ecommerce.API.Tests.Integration
{
    public class CustomWebApplicationFactory : WebApplicationFactory<Program>
    {
        private readonly InMemoryDatabaseRoot _databaseRoot = new();
        private readonly string _databaseName = $"EcommerceIntegrationTests-{Guid.NewGuid()}";

        protected override void ConfigureWebHost(IWebHostBuilder builder)
        {
            builder.ConfigureServices(services =>
            {
                services.RemoveAll<DbContextOptions<ApplicationDbContext>>();

                services.AddDbContext<ApplicationDbContext>(options =>
                {
                    options.UseInMemoryDatabase(_databaseName, _databaseRoot);
                });

                using var serviceProvider = services.BuildServiceProvider();
                using var scope = serviceProvider.CreateScope();

                var scopedServices = scope.ServiceProvider;
                var dbContext = scopedServices.GetRequiredService<ApplicationDbContext>();
                var roleManager = scopedServices.GetRequiredService<RoleManager<IdentityRole>>();
                var userManager = scopedServices.GetRequiredService<UserManager<ApplicationUser>>();

                dbContext.Database.EnsureDeleted();
                dbContext.Database.EnsureCreated();

                SeedAsync(dbContext, roleManager, userManager).GetAwaiter().GetResult();
            });
        }

        private static async Task SeedAsync(
            ApplicationDbContext dbContext,
            RoleManager<IdentityRole> roleManager,
            UserManager<ApplicationUser> userManager)
        {
            await EnsureRoleAsync(roleManager, "Admin");
            await EnsureRoleAsync(roleManager, "Customer");

            await EnsureUserAsync(
                userManager,
                "customer@test.com",
                "Password123!",
                "Customer");

            await EnsureUserAsync(
                userManager,
                "admin@test.com",
                "Password123!",
                "Admin");

            if (!await dbContext.Categories.AnyAsync(c => c.Id == 1))
            {
                dbContext.Categories.Add(new Category
                {
                    Id = 1,
                    Name = "Gaming Mouse"
                });
            }

            if (!await dbContext.Products.AnyAsync(p => p.Id == 1))
            {
                dbContext.Products.Add(new Product
                {
                    Id = 1,
                    Name = "Logitech G502 X",
                    Price = 69.99m,
                    StockQuantity = 5,
                    IsFeatured = true,
                    CategoryId = 1
                });
            }

            await dbContext.SaveChangesAsync();
        }

        private static async Task EnsureRoleAsync(
            RoleManager<IdentityRole> roleManager,
            string roleName)
        {
            if (!await roleManager.RoleExistsAsync(roleName))
            {
                await roleManager.CreateAsync(new IdentityRole(roleName));
            }
        }

        private static async Task EnsureUserAsync(
            UserManager<ApplicationUser> userManager,
            string email,
            string password,
            string roleName)
        {
            var user = await userManager.FindByEmailAsync(email);

            if (user == null)
            {
                user = new ApplicationUser
                {
                    UserName = email,
                    Email = email,
                    EmailConfirmed = true,
                    FirstName = roleName,
                    LastName = "User"
                };

                await userManager.CreateAsync(user, password);
            }

            if (!await userManager.IsInRoleAsync(user, roleName))
            {
                await userManager.AddToRoleAsync(user, roleName);
            }
        }
    }
}
