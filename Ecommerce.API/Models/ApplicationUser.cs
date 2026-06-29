using Microsoft.AspNetCore.Identity;

namespace Ecommerce.API.Models
{
    public class ApplicationUser: IdentityUser
    {
        public string FirstName { get; set; }
            = string.Empty;

        public string LastName { get; set; }
            = string.Empty;

        public string Address { get; set; }
            = string.Empty;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation Properties
        public ICollection<Order> Orders { get; set; } = new List<Order>();

        public Cart? Cart { get; set; }
    }
}
