using Ecommerce.API.DTOs.Product;

namespace Ecommerce.API.Services.Interfaces
{
    public interface IProductService
    {
        Task<IEnumerable<ProductDto>> GetAllAsync();

        Task<ProductDto?> GetByIdAsync(int id);

        Task<ProductDto> CreateAsync(CreateProductDto dto);

        Task<ProductDto> UpdateAsync(int id, UpdateProductDto dto);

        Task<bool> DeleteAsync(int id);

        Task<IEnumerable<ProductDto>> SearchAsync(string keyword);

        Task<IEnumerable<ProductDto>> GetFeaturedProductsAsync();

        Task<IEnumerable<ProductDto>> GetProductsByCategoryAsync(int categoryId);
    }
}
