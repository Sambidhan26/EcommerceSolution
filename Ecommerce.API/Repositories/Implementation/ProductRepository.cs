using Ecommerce.API.Data;
using Ecommerce.API.Models;
using Ecommerce.API.Repositories.Interfaces;
using Ecommerce.API.Services.Implementation;
using Microsoft.EntityFrameworkCore;

namespace Ecommerce.API.Repositories.Implementation
{
    public class ProductRepository
     : GenericRepository<Product>, IProductRepository
    {
        private readonly ApplicationDbContext _context;

        public ProductRepository(ApplicationDbContext context)
            : base(context)
        {
            _context = context;
        }

        private IQueryable<Product> ProductsWithCategory()
        {
            return _context.Products
                .Include(p => p.Category);
        }

        public async Task<bool> ExistsBySkuAsync(string sku)
        {
            return await _context.Products
                .AnyAsync(p => p.SKU == sku);
        }

        public async Task<IEnumerable<Product>> SearchByNameAsync(string keyword)
        {
            return await ProductsWithCategory()
                .Where(p => EF.Functions.Like(p.Name, $"%{keyword}%"))
                .ToListAsync();
        }

        public async Task<IEnumerable<Product>> GetFeaturedProductsAsync()
        {
            return await ProductsWithCategory()
                .Where(p => p.IsFeatured)
                .ToListAsync();
        }

        public async Task<IEnumerable<Product>> GetProductsByCategoryAsync(int categoryId)
        {
            return await ProductsWithCategory()
                .Where(p => p.CategoryId == categoryId)
                .ToListAsync();
        }

        public async Task<Product?> GetProductWithCategoryAsync(int id)
        {
            return await ProductsWithCategory()
                .FirstOrDefaultAsync(p => p.Id == id);
        }

        public async Task<IEnumerable<Product>> GetAllWithCategoryAsync()
        {
            return await ProductsWithCategory()
                .ToListAsync();
        }
    }
}
