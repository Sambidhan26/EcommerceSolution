using Ecommerce.API.Models;
using Ecommerce.API.Services.Interfaces;

namespace Ecommerce.API.Repositories.Interfaces
{
    public interface ICartRepository: IGenericRepository<Cart>
    {
        Task<Cart?> GetCartByUserIdAsync(string userId);

        Task<Cart?> GetCartWithItemsAsync(string userId);
    }
}
