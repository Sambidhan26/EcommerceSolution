using Ecommerce.API.Models;

namespace Ecommerce.API.DTOs.Order
{
    public class UpdateOrderStatusDto
    {
        public OrderStatus Status { get; set; }
    }
}
