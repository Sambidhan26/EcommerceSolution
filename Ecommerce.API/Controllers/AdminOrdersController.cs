using Ecommerce.API.Common;
using Ecommerce.API.DTOs.Order;
using Ecommerce.API.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Ecommerce.API.Controllers
{
    [ApiController]
    [Route("api/admin/orders")]
    [Authorize(Roles = "Admin")]
    public class AdminOrdersController : ControllerBase
    {
        private readonly IOrderService _orderService;

        public AdminOrdersController(IOrderService orderService)
        {
            _orderService = orderService;
        }

        [HttpGet]
        public async Task<ActionResult<ApiResponse<IEnumerable<OrderDto>>>> GetAllOrders()
        {
            var orders = await _orderService.GetAllOrdersAsync();

            return Ok(ApiResponse<IEnumerable<OrderDto>>.SuccessResponse(
                orders,
                "Orders retrieved successfully."));
        }

        [HttpGet("{orderId:int}")]
        public async Task<ActionResult<ApiResponse<OrderDto>>> GetOrder(int orderId)
        {
            var order = await _orderService.GetOrderForAdminAsync(orderId);

            if (order == null)
            {
                return NotFound();
            }

            return Ok(ApiResponse<OrderDto>.SuccessResponse(
                order,
                "Order retrieved successfully."));
        }

        [HttpPut("{orderId:int}/status")]
        public async Task<ActionResult<ApiResponse<OrderDto>>> UpdateOrderStatus(
            int orderId,
            [FromBody] UpdateOrderStatusDto dto)
        {
            var order = await _orderService.UpdateOrderStatusAsync(orderId, dto);

            if (order == null)
            {
                return NotFound();
            }

            return Ok(ApiResponse<OrderDto>.SuccessResponse(
                order,
                "Order status updated successfully."));
        }
    }
}
