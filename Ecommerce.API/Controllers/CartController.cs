using System.Security.Claims;
using Ecommerce.API.Common;
using Ecommerce.API.DTOs.Cart;
using Ecommerce.API.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Ecommerce.API.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class CartController : ControllerBase
    {
        private readonly ICartService _cartService;

        public CartController(ICartService cartService)
        {
            _cartService = cartService;
        }

        [HttpPost]
        public async Task<ActionResult<ApiResponse<CartDto>>> AddToCart([FromBody] AddToCartDto dto)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            if (string.IsNullOrWhiteSpace(userId))
            {
                return Unauthorized();
            }

            var cart = await _cartService.AddToCartAsync(userId, dto);

            return Ok(ApiResponse<CartDto>.SuccessResponse(
                cart,
                "Product added to cart successfully."));
        }

        [HttpGet]
        public async Task<ActionResult<ApiResponse<CartDto>>> GetCart()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            if (string.IsNullOrWhiteSpace(userId))
            {
                return Unauthorized();
            }

            var cart = await _cartService.GetCartAsync(userId);

            if (cart == null)
            {
                cart = new CartDto
                {
                    Items = new List<CartItemDto>(),
                    TotalPrice = 0,
                    TotalItems = 0
                };
            }

            return Ok(ApiResponse<CartDto>.SuccessResponse(
                cart,
                "Cart retrieved successfully."));
        }

        [HttpPut("items/{cartItemId}")]
        public async Task<ActionResult<ApiResponse<CartDto>>> UpdateCartItem(
            int cartItemId,
            [FromBody] UpdateCartItemDto dto)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            if (string.IsNullOrWhiteSpace(userId))
            {
                return Unauthorized();
            }

            var cart = await _cartService.UpdateCartItemAsync(
                userId,
                cartItemId,
                dto);

            if (cart == null)
            {
                return NotFound();
            }

            return Ok(ApiResponse<CartDto>.SuccessResponse(
                cart,
                "Cart item updated successfully."));
        }

        [HttpDelete("items/{cartItemId}")]
        public async Task<ActionResult<ApiResponse<CartDto>>> RemoveCartItem(int cartItemId)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            if (string.IsNullOrWhiteSpace(userId))
            {
                return Unauthorized();
            }

            var cart = await _cartService.RemoveCartItemAsync(
                userId,
                cartItemId);

            if (cart == null)
            {
                return NotFound();
            }

            return Ok(ApiResponse<CartDto>.SuccessResponse(
                cart,
                "Cart item removed successfully."));
        }

        [HttpDelete]
        public async Task<ActionResult<ApiResponse<CartDto>>> ClearCart()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            if (string.IsNullOrWhiteSpace(userId))
            {
                return Unauthorized();
            }

            var cart = await _cartService.ClearCartAsync(userId);

            if (cart == null)
            {
                return NotFound();
            }

            return Ok(ApiResponse<CartDto>.SuccessResponse(
                cart,
                "Cart cleared successfully."));
        }
    }
}
