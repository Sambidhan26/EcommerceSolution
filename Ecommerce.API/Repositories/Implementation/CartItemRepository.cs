using Ecommerce.API.Data;
using Ecommerce.API.Models;
using Ecommerce.API.Repositories.Interfaces;
using Ecommerce.API.Services.Implementation;
using Microsoft.EntityFrameworkCore;

namespace Ecommerce.API.Repositories.Implementation
{
    public class CartItemRepository:GenericRepository<CartItem>, ICartItemRepository
    {
        private readonly ApplicationDbContext _context;

        public CartItemRepository(ApplicationDbContext context)
            : base(context)
        {
            _context = context;
        }

        public Task DeleteCartItemsAsync(int cartId)
        {
            throw new NotImplementedException();
        }

        public async Task<CartItem?> GetCartItemAsync(int cartId, int productId)
        {
            return await _context.CartItems
                .Include(ci => ci.Product)
                .FirstOrDefaultAsync(ci =>
                    ci.CartId == cartId &&
                    ci.ProductId == productId);
        }

        public async Task<IEnumerable<CartItem>> GetCartItemsAsync(int cartId)
        {
            return await _context.CartItems
                .Include(ci => ci.Product)
                .Where(ci => ci.CartId == cartId)
                .ToListAsync();
        }
    }
}
