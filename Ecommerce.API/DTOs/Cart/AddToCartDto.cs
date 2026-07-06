using System.ComponentModel.DataAnnotations;

namespace Ecommerce.API.DTOs.Cart
{
    public class AddToCartDto
    {
        [Range(1, int.MaxValue)]
        public int ProductId { get; set; }

        [Range(1, int.MaxValue)]
        public int Quantity { get; set; }
    }
}
