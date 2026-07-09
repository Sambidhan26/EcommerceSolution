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
        public async Task<ActionResult<IEnumerable<OrderDto>>> GetAllOrders()
        {
            var orders = await _orderService.GetAllOrdersAsync();

            return Ok(orders);
        }

        [HttpGet("{orderId:int}")]
        public async Task<ActionResult<OrderDto>> GetOrder(int orderId)
        {
            var order = await _orderService.GetOrderForAdminAsync(orderId);

            if (order == null)
            {
                return NotFound();
            }

            return Ok(order);
        }

        [HttpPut("{orderId:int}/status")]
        public async Task<ActionResult<OrderDto>> UpdateOrderStatus(
            int orderId,
            UpdateOrderStatusDto dto)
        {
            var order = await _orderService.UpdateOrderStatusAsync(orderId, dto);

            if (order == null)
            {
                return NotFound();
            }

            return Ok(order);
        }
    }
}
