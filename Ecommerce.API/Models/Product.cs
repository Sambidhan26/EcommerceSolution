namespace Ecommerce.API.Models
{
    public class Product : BaseEntity
    {

        public string Name { get; set; }
            = string.Empty;

        public string Description { get; set; }
            = string.Empty;

        public decimal Price { get; set; }

        public int StockQuantity { get; set; }

        public string SKU { get; set; } = string.Empty;

        public string? ImageUrl { get; set; }

        public bool IsFeatured { get; set; } = false;

        // Foreign Key
        public int CategoryId { get; set; }

        // Navigation Property
        public Category? Category { get; set; }

        public ICollection<CartItem> CartItems { get; set; }
            = new List<CartItem>();

        public ICollection<OrderItem> OrderItems { get; set; }
            = new List<OrderItem>();
    }
}
