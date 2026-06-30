namespace Ecommerce.API.Models
{
    public class OrderItem : BaseEntity
    {

        public int Quantity { get; set; }

        public decimal UnitPrice { get; set; }

        // Foreign Keys
        public int OrderId { get; set; }

        public int ProductId { get; set; }

        // Navigation Properties
        public Order? Order { get; set; }

        public Product? Product { get; set; }
    }
}
