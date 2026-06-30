namespace Ecommerce.API.Models
{
    public class Order : BaseEntity
    {

        public DateTime OrderDate { get; set; }
            = DateTime.UtcNow;

        public decimal TotalAmount { get; set; }

        public OrderStatus Status { get; set; } = OrderStatus.Pending;

        // Foreign Key
        public string UserId { get; set; }
            = string.Empty;

        // Navigation Property
        public ApplicationUser? User { get; set; }

        public ICollection<OrderItem> OrderItems { get; set; } = new List<OrderItem>();
    }
}
