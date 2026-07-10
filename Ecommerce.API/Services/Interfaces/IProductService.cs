using Ecommerce.API.Common;
using Ecommerce.API.DTOs.Product;
using Microsoft.AspNetCore.Http;

namespace Ecommerce.API.Services.Interfaces
{
    public interface IProductService
    {
        Task<IEnumerable<ProductDto>> GetAllAsync();

        Task<ProductDto?> GetByIdAsync(int id);

        Task<ProductDto> CreateAsync(CreateProductDto dto);

        Task<ProductDto?> UpdateAsync(int id, UpdateProductDto dto);

        Task<bool> DeleteAsync(int id);

        Task<IEnumerable<ProductDto>> SearchAsync(string keyword);

        Task<IEnumerable<ProductDto>> GetFeaturedProductsAsync();

        Task<IEnumerable<ProductDto>> GetProductsByCategoryAsync(int categoryId);

        Task<PagedResult<ProductDto>> GetPagedProductsAsync(PaginationParams paginationParams);

        Task<PagedResult<ProductDto>> GetFilteredProductsAsync(ProductFilterParams filterParams);

        Task<ProductDto?> UploadProductImageAsync(int id, IFormFile file);
    }
}
