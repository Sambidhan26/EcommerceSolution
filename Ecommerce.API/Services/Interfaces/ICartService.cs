using Ecommerce.API.DTOs.Cart;

namespace Ecommerce.API.Services.Interfaces
{
    public interface ICartService
    {
        Task<CartDto> AddToCartAsync(string userId, AddToCartDto dto);
    }
}
