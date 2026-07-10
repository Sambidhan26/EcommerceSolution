using Ecommerce.API.Common;
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

        public async Task<(IEnumerable<Product> Items, int TotalCount)> GetPagedProductsAsync(
            int pageNumber,
            int pageSize)
        {
            var query = ProductsWithCategory();

            var totalCount = await query.CountAsync();

            var items = await query
                .OrderByDescending(p => p.Id)
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return (items, totalCount);
        }

        public async Task<(IEnumerable<Product> Items, int TotalCount)> GetFilteredProductsAsync(
     ProductFilterParams filterParams)
        {
            var query = ProductsWithCategory();

            if (!string.IsNullOrWhiteSpace(filterParams.Search))
            {
                var search = filterParams.Search.Trim();

                query = query.Where(p =>
                    p.Name.Contains(search) ||
                    (p.Description != null && p.Description.Contains(search)));
            }

            if (filterParams.CategoryId.HasValue)
            {
                query = query.Where(p => p.CategoryId == filterParams.CategoryId.Value);
            }

            if (filterParams.IsFeatured.HasValue)
            {
                query = query.Where(p => p.IsFeatured == filterParams.IsFeatured.Value);
            }

            var totalCount = await query.CountAsync();

            var sortBy = filterParams.SortBy?.Trim().ToLower();
            var sortOrder = filterParams.SortOrder?.Trim().ToLower();

            query = sortBy switch
            {
                "price" => sortOrder == "asc"
                    ? query.OrderBy(p => p.Price)
                    : query.OrderByDescending(p => p.Price),

                "name" => sortOrder == "asc"
                    ? query.OrderBy(p => p.Name)
                    : query.OrderByDescending(p => p.Name),

                "date" => sortOrder == "asc"
                    ? query.OrderBy(p => p.CreatedAt)
                    : query.OrderByDescending(p => p.CreatedAt),

                _ => query.OrderByDescending(p => p.Id)
            };

            var items = await query
                .Skip((filterParams.PageNumber - 1) * filterParams.PageSize)
                .Take(filterParams.PageSize)
                .ToListAsync();

            return (items, totalCount);
        }
    }
}
