using Ecommerce.API.Models;
using Ecommerce.API.Services.Interfaces;

namespace Ecommerce.API.Repositories.Interfaces
{
    public interface IOrderRepository : IGenericRepository<Order>
    {
        Task<IEnumerable<Order>> GetOrdersByUserAsync(string userId);

        Task<Order?> GetOrderWithItemsAsync(int orderId);

        Task<Order?> GetOrderWithItemsByUserAsync(int orderId, string userId);
    }
}
