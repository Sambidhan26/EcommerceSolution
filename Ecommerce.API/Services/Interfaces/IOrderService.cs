using Ecommerce.API.DTOs.Order;

namespace Ecommerce.API.Services.Interfaces
{
    public interface IOrderService
    {
        Task<OrderDto> CheckoutAsync(string userId);
        Task<IEnumerable<OrderDto>> GetMyOrdersAsync(string userId);
        Task<OrderDto?> GetOrderAsync(int orderId, string userId);
        Task<IEnumerable<OrderDto>> GetAllOrdersAsync();
        Task<OrderDto?> GetOrderForAdminAsync(int orderId);
        Task<OrderDto?> UpdateOrderStatusAsync(int orderId, UpdateOrderStatusDto dto);
    }
}
