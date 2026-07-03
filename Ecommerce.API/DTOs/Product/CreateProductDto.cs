using System.ComponentModel.DataAnnotations;

namespace Ecommerce.API.DTOs.Product
{
    public class CreateProductDto
    {
        [Required]
        [StringLength(150)]
        public string Name { get; set; } = string.Empty;

        [StringLength(1000)]
        public string? Description { get; set; }

        [Range(0.01, 1000000)]
        public decimal Price { get; set; }

        [Range(0, int.MaxValue)]
        public int StockQuantity { get; set; }

        public string? ImageUrl { get; set; }

        public bool IsFeatured { get; set; }

        [Required]
        public int CategoryId { get; set; }
    }
}
