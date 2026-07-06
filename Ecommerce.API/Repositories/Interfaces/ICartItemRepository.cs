using Ecommerce.API.Models;
using Ecommerce.API.Services.Interfaces;

namespace Ecommerce.API.Repositories.Interfaces
{
    public interface ICartItemRepository : IGenericRepository<CartItem>
    {
        Task<CartItem?> GetCartItemAsync(int cartId, int productId);

        Task<IEnumerable<CartItem>> GetCartItemsAsync(int cartId);
        Task DeleteCartItemsAsync(int cartId);
    }
}
