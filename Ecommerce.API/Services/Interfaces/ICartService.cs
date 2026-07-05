using Ecommerce.API.DTOs.Cart;

namespace Ecommerce.API.Services.Interfaces
{
    public interface ICartService
    {
        Task<CartDto> AddToCartAsync(string userId, AddToCartDto dto);

        Task<CartDto?> GetCartAsync(string userId);

        Task<CartDto> UpdateCartItemAsync(
            string userId,
            int cartItemId,
            UpdateCartItemDto dto);

        Task RemoveCartItemAsync(string userId, int cartItemId);

        Task ClearCartAsync(string userId);
    }
}
