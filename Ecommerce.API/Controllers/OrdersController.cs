using System.Security.Claims;
using Ecommerce.API.Common;
using Ecommerce.API.DTOs.Order;
using Ecommerce.API.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Ecommerce.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class OrdersController : ControllerBase
    {
        private readonly IOrderService _orderService;

        public OrdersController(IOrderService orderService)
        {
            _orderService = orderService;
        }

        [HttpPost("checkout")]
        public async Task<ActionResult<ApiResponse<OrderDto>>> Checkout()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            if (string.IsNullOrWhiteSpace(userId))
            {
                return Unauthorized();
            }

            var order = await _orderService.CheckoutAsync(userId);

            return Ok(ApiResponse<OrderDto>.SuccessResponse(
                order,
                "Checkout completed successfully."));
        }

        [HttpGet]
        public async Task<ActionResult<ApiResponse<IEnumerable<OrderDto>>>> GetMyOrders()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            if (string.IsNullOrWhiteSpace(userId))
            {
                return Unauthorized();
            }

            var orders = await _orderService.GetMyOrdersAsync(userId);

            return Ok(ApiResponse<IEnumerable<OrderDto>>.SuccessResponse(
                orders,
                "Orders retrieved successfully."));
        }

        [HttpGet("{orderId:int}")]
        public async Task<ActionResult<ApiResponse<OrderDto>>> GetOrder(int orderId)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            if (string.IsNullOrWhiteSpace(userId))
            {
                return Unauthorized();
            }

            var order = await _orderService.GetOrderAsync(orderId, userId);

            if (order == null)
            {
                return NotFound();
            }

            return Ok(ApiResponse<OrderDto>.SuccessResponse(
                order,
                "Order retrieved successfully."));
        }
    }
}
