using Ecommerce.API.Models;
using Ecommerce.API.Services.Interfaces;

namespace Ecommerce.API.Repositories.Interfaces
{
    public interface IProductRepository : IGenericRepository<Product>
    {
        Task<bool> ExistsBySkuAsync(string sku);

        Task<IEnumerable<Product>> SearchByNameAsync(string keyword);

        Task<IEnumerable<Product>> GetFeaturedProductsAsync();

        Task<IEnumerable<Product>> GetProductsByCategoryAsync(int categoryId);

        Task<Product?> GetProductWithCategoryAsync(int id);

        Task<IEnumerable<Product>> GetAllWithCategoryAsync();

        Task<(IEnumerable<Product> Items, int TotalCount)> GetPagedProductsAsync(
            int pageNumber,
            int pageSize);
    }


}
