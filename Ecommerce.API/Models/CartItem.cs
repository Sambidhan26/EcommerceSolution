namespace Ecommerce.API.Models
{
    public class CartItem : BaseEntity
    {

        public int Quantity { get; set; }
        public decimal UnitPrice { get; set; }

        // Foreign Keys
        public int CartId { get; set; }

        public int ProductId { get; set; }


        // Navigation Properties
        public Cart? Cart { get; set; }
            
        public Product? Product { get; set; }
    }
}
