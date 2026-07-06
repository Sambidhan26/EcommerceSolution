using Ecommerce.API.Data;
using Ecommerce.API.Models;
using Ecommerce.API.Repositories.Interfaces;
using Ecommerce.API.Services.Implementation;
using Ecommerce.API.Services.Interfaces;
using Microsoft.EntityFrameworkCore;
using System.Linq.Expressions;

namespace Ecommerce.API.Repositories.Implementation
{
    public class CartRepository : GenericRepository<Cart>, ICartRepository
    {
        private readonly ApplicationDbContext _context;

        public CartRepository(ApplicationDbContext context)
            : base(context)
        {
            _context = context;
        }
        public Task CreateAsync(Cart entity)
        {
            throw new NotImplementedException();
        }

        public Task DeleteAsync(Cart entity)
        {
            throw new NotImplementedException();
        }

        public Task<IEnumerable<Cart>> GetAllAsync(Expression<Func<Cart, bool>>? filter = null, Func<IQueryable<Cart>, IOrderedQueryable<Cart>>? orderBy = null, string? includeProperties = null)
        {
            throw new NotImplementedException();
        }

        public async Task<Cart?> GetCartByUserIdAsync(string userId)
        {
            return await _context.Carts
                .FirstOrDefaultAsync(c => c.UserId == userId);
        }


        public async Task<Cart?> GetCartWithItemsAsync(string userId)
        {
            return await _context.Carts
                .Include(c => c.CartItems)
                .ThenInclude(ci => ci.Product)
                .FirstOrDefaultAsync(c => c.UserId == userId);
        }

        public Task UpdateAsync(Cart entity)
        {
            throw new NotImplementedException();
        }

        Task<Cart?> IGenericRepository<Cart>.GetByIdAsync(int id)
        {
            throw new NotImplementedException();
        }
    }
}
