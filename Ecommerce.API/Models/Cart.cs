namespace Ecommerce.API.Models
{
    public class Cart : BaseEntity
    {

        // Foreign Key
        public string UserId { get; set; }
            = string.Empty;

        // Navigation Property
        public ApplicationUser? User { get; set; }

        public DateTime CreatedAt { get; set; }
            = DateTime.UtcNow;

        public ICollection<CartItem> CartItems { get; set; }
            = new List<CartItem>();
    }
}
