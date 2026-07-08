using AutoMapper;
using Ecommerce.API.Common;
using Ecommerce.API.Common.Exceptions;
using Ecommerce.API.DTOs.Product;
using Ecommerce.API.Models;
using Ecommerce.API.Repositories.Interfaces;
using Ecommerce.API.Services.Interfaces;

namespace Ecommerce.API.Services.Implementation
{
    public class ProductService : IProductService
    {
        private readonly IProductRepository _productRepository;
        private readonly ICategoryRepository _categoryRepository;
        private readonly IMapper _mapper;

        public ProductService(
            IProductRepository productRepository,
            ICategoryRepository categoryRepository,
            IMapper mapper)
        {
            _productRepository = productRepository;
            _categoryRepository = categoryRepository;
            _mapper = mapper;
        }

        private string GenerateSku()
        {
            return $"PRD-{DateTime.UtcNow:yyyyMMddHHmmssfff}";
        }

        public async Task<ProductDto> CreateAsync(CreateProductDto dto)
        {
            var category = await _categoryRepository.GetByIdAsync(dto.CategoryId);

            if (category == null)
            {
                throw new NotFoundException("Category not found.");
            }

            var product = _mapper.Map<Product>(dto);

            product.SKU = GenerateSku();

            await _productRepository.CreateAsync(product);
            await _productRepository.SaveChangesAsync();

            var createdProduct = await _productRepository
                .GetProductWithCategoryAsync(product.Id);

            if (createdProduct == null)
            {
                throw new InvalidOperationException("Product could not be retrieved.");
            }

            return _mapper.Map<ProductDto>(createdProduct);
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var product = await _productRepository.GetByIdAsync(id);

            if (product == null)
            {
                return false;
            }

            await _productRepository.DeleteAsync(product);
            await _productRepository.SaveChangesAsync();

            return true;
        }

        public async Task<IEnumerable<ProductDto>> GetAllAsync()
        {
            var products = await _productRepository.GetAllWithCategoryAsync();

            return _mapper.Map<IEnumerable<ProductDto>>(products);
        }

        public async Task<ProductDto?> GetByIdAsync(int id)
        {
            var product = await _productRepository.GetProductWithCategoryAsync(id);

            if (product == null)
            {
                return null;
            }

            return _mapper.Map<ProductDto>(product);
        }

        public async Task<IEnumerable<ProductDto>> GetFeaturedProductsAsync()
        {
            var products = await _productRepository.GetFeaturedProductsAsync();

            return _mapper.Map<IEnumerable<ProductDto>>(products);
        }

        public async Task<IEnumerable<ProductDto>> GetProductsByCategoryAsync(int categoryId)
        {
            var products = await _productRepository.GetProductsByCategoryAsync(categoryId);

            return _mapper.Map<IEnumerable<ProductDto>>(products);
        }

        public async Task<IEnumerable<ProductDto>> SearchAsync(string keyword)
        {
            var products = await _productRepository.SearchByNameAsync(keyword);

            return _mapper.Map<IEnumerable<ProductDto>>(products);
        }

        public async Task<PagedResult<ProductDto>> GetPagedProductsAsync(
            PaginationParams paginationParams)
        {
            var (items, totalCount) = await _productRepository.GetPagedProductsAsync(
                paginationParams.PageNumber,
                paginationParams.PageSize);

            var products = _mapper.Map<IEnumerable<ProductDto>>(items);

            return new PagedResult<ProductDto>
            {
                Items = products,
                PageNumber = paginationParams.PageNumber,
                PageSize = paginationParams.PageSize,
                TotalCount = totalCount,
                TotalPages = (int)Math.Ceiling(totalCount / (double)paginationParams.PageSize)
            };
        }

        public async Task<ProductDto?> UpdateAsync(int id, UpdateProductDto dto)
        {
            var product = await _productRepository.GetByIdAsync(id);

            if (product == null)
            {
                return null;
            }

            var category = await _categoryRepository.GetByIdAsync(dto.CategoryId);

            if (category == null)
            {
                throw new NotFoundException("Category not found.");
            }

            _mapper.Map(dto, product);

            await _productRepository.UpdateAsync(product);
            await _productRepository.SaveChangesAsync();

            var updatedProduct = await _productRepository.GetProductWithCategoryAsync(id);

            return _mapper.Map<ProductDto>(updatedProduct);
        }
    }
}
