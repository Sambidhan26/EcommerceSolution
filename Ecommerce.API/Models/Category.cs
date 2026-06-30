namespace Ecommerce.API.Models
{
    public class Category : BaseEntity
    {

        public string Name { get; set; }
            = string.Empty;

        public string Description { get; set; }
            = string.Empty;

        // Navigation Property
        public ICollection<Product> Products { get; set; }
            = new List<Product>();
    }
}
