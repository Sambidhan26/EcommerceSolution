using Ecommerce.API.Common;
using Ecommerce.API.DTOs.Product;
using Ecommerce.API.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Ecommerce.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ProductController : ControllerBase
    {
        private readonly IProductService _productService;

        public ProductController(IProductService productService)
        {
            _productService = productService;
        }

        [HttpGet]
        public async Task<ActionResult<ApiResponse<IEnumerable<ProductDto>>>> GetAll()
        {
            var products = await _productService.GetAllAsync();

            return Ok(ApiResponse<IEnumerable<ProductDto>>.SuccessResponse(
                products,
                "Products retrieved successfully."));
        }

        [HttpGet("paged")]
        public async Task<ActionResult<ApiResponse<PagedResult<ProductDto>>>> GetPaged(
            [FromQuery] PaginationParams paginationParams)
        {
            var products = await _productService.GetPagedProductsAsync(paginationParams);

            return Ok(ApiResponse<PagedResult<ProductDto>>.SuccessResponse(
                products,
                "Products retrieved successfully."));
        }

        [HttpGet("filter")]
        public async Task<ActionResult<ApiResponse<PagedResult<ProductDto>>>> GetFiltered(
            [FromQuery] ProductFilterParams filterParams)
        {
            var result = await _productService.GetFilteredProductsAsync(filterParams);

            return Ok(ApiResponse<PagedResult<ProductDto>>.SuccessResponse(
                result,
                "Products retrieved successfully."));
        }

        [HttpGet("{id:int}")]
        public async Task<ActionResult<ApiResponse<ProductDto>>> GetById(int id)
        {
            var product = await _productService.GetByIdAsync(id);

            if (product == null)
            {
                return NotFound();
            }

            return Ok(ApiResponse<ProductDto>.SuccessResponse(
                product,
                "Product retrieved successfully."));
        }

        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<ApiResponse<ProductDto>>> Create([FromBody] CreateProductDto dto)
        {
            var product = await _productService.CreateAsync(dto);

            return CreatedAtAction(
                nameof(GetById),
                new { id = product.Id },
                ApiResponse<ProductDto>.SuccessResponse(
                    product,
                    "Product created successfully."));
        }

        [HttpPut("{id:int}")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<ApiResponse<ProductDto>>> Update(int id, [FromBody] UpdateProductDto dto)
        {
            var product = await _productService.UpdateAsync(id, dto);

            if (product == null)
            {
                return NotFound();
            }

            return Ok(ApiResponse<ProductDto>.SuccessResponse(
                product,
                "Product updated successfully."));
        }

        [HttpDelete("{id:int}")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult> Delete(int id)
        {
            var result = await _productService.DeleteAsync(id);

            if (!result)
            {
                return NotFound();
            }

            return NoContent();
        }

        [HttpGet("search")]
        public async Task<ActionResult<IEnumerable<ProductDto>>> Search([FromQuery] string keyword)
        {
            var products = await _productService.SearchAsync(keyword);

            return Ok(products);
        }

        [HttpGet("featured")]
        public async Task<ActionResult<IEnumerable<ProductDto>>> GetFeatured()
        {
            var products = await _productService.GetFeaturedProductsAsync();

            return Ok(products);
        }

        [HttpGet("category/{categoryId:int}")]
        public async Task<ActionResult<IEnumerable<ProductDto>>> GetByCategory(int categoryId)
        {
            var products = await _productService
                .GetProductsByCategoryAsync(categoryId);

            return Ok(products);
        }
    }
}
