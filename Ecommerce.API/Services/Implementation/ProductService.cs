using AutoMapper;
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
            // Check if category exists
            var category = await _categoryRepository.GetByIdAsync(dto.CategoryId);

            if (category == null)
            {
                throw new Exception("Category not found.");
            }

            // Map DTO to Product
            var product = _mapper.Map<Product>(dto);

            // Generate SKU
            product.SKU = GenerateSku();

            // Save Product
            await _productRepository.CreateAsync(product);

            // Retrieve Product with Category included
            var createdProduct = await _productRepository
                .GetProductWithCategoryAsync(product.Id);

            if (createdProduct == null)
            {
                throw new Exception("Product could not be retrieved.");
            }

            return _mapper.Map<ProductDto>(createdProduct);
        }

        public Task<bool> DeleteAsync(int id)
        {
            throw new NotImplementedException();
        }

        public async Task<IEnumerable<ProductDto>> GetAllAsync()
        {
            var products = await _productRepository.GetAllWithCategoryAsync();

            return _mapper.Map<IEnumerable<ProductDto>>(products);
        }

        public Task<ProductDto?> GetByIdAsync(int id)
        {
            throw new NotImplementedException();
        }

        public Task<IEnumerable<ProductDto>> GetFeaturedProductsAsync()
        {
            throw new NotImplementedException();
        }

        public Task<IEnumerable<ProductDto>> GetProductsByCategoryAsync(int categoryId)
        {
            throw new NotImplementedException();
        }

        public Task<IEnumerable<ProductDto>> SearchAsync(string keyword)
        {
            throw new NotImplementedException();
        }

        public Task<bool> UpdateAsync(int id, UpdateProductDto dto)
        {
            throw new NotImplementedException();
        }

        
    }
    }
