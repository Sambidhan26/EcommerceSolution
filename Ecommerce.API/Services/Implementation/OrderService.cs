using AutoMapper;
using Ecommerce.API.Common.Exceptions;
using Ecommerce.API.Data;
using Ecommerce.API.DTOs.Order;
using Ecommerce.API.Models;
using Ecommerce.API.Repositories.Interfaces;
using Ecommerce.API.Services.Interfaces;

namespace Ecommerce.API.Services.Implementation
{
    public class OrderService : IOrderService
    {
        private readonly IOrderRepository _orderRepository;
        private readonly ICartRepository _cartRepository;
        private readonly ICartItemRepository _cartItemRepository;
        private readonly ApplicationDbContext _context;
        private readonly IMapper _mapper;

        public OrderService(
            IOrderRepository orderRepository,
            ICartRepository cartRepository,
            ICartItemRepository cartItemRepository,
            IMapper mapper,
            ApplicationDbContext context)
        {
            _orderRepository = orderRepository;
            _cartRepository = cartRepository;
            _cartItemRepository = cartItemRepository;
            _mapper = mapper;
            _context = context;
        }

        public async Task<OrderDto> CheckoutAsync(string userId)
        {
            await using var transaction =
                await _context.Database.BeginTransactionAsync();

            try
            {
                var cart = await _cartRepository.GetCartWithItemsAsync(userId);

                if (cart == null || !cart.CartItems.Any())
                {
                    throw new BadRequestException("Cart is empty.");
                }

                foreach (var cartItem in cart.CartItems)
                {
                    if (cartItem.Product == null)
                    {
                        throw new NotFoundException("Product not found.");
                    }

                    if (cartItem.Product.StockQuantity < cartItem.Quantity)
                    {
                        throw new BadRequestException(
                            $"Insufficient stock for product: {cartItem.Product.Name}");
                    }
                }

                var order = new Order
                {
                    UserId = userId,
                    OrderDate = DateTime.UtcNow,
                    Status = OrderStatus.Pending,
                    TotalAmount = cart.CartItems.Sum(ci =>
                        ci.Quantity * ci.UnitPrice)
                };

                foreach (var cartItem in cart.CartItems)
                {
                    order.OrderItems.Add(new OrderItem
                    {
                        ProductId = cartItem.ProductId,
                        Quantity = cartItem.Quantity,
                        UnitPrice = cartItem.UnitPrice
                    });

                    cartItem.Product!.StockQuantity -= cartItem.Quantity;
                }

                await _orderRepository.CreateAsync(order);

                foreach (var cartItem in cart.CartItems.ToList())
                {
                    await _cartItemRepository.DeleteAsync(cartItem);
                }

                await _orderRepository.SaveChangesAsync();

                await transaction.CommitAsync();

                var savedOrder =
                    await _orderRepository.GetOrderWithItemsAsync(order.Id);

                if (savedOrder == null)
                {
                    throw new BadRequestException("Order could not be loaded.");
                }

                return _mapper.Map<OrderDto>(savedOrder);
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }
        }

        public async Task<IEnumerable<OrderDto>> GetMyOrdersAsync(string userId)
        {
            var orders = await _orderRepository
                .GetOrdersByUserAsync(userId);

            return _mapper.Map<IEnumerable<OrderDto>>(orders);
        }

        public async Task<OrderDto?> GetOrderAsync(int orderId, string userId)
        {
            var order = await _orderRepository
                .GetOrderWithItemsByUserAsync(orderId, userId);

            if (order == null)
            {
                return null;
            }

            return _mapper.Map<OrderDto>(order);
        }

        public async Task<IEnumerable<OrderDto>> GetAllOrdersAsync()
        {
            var orders = await _orderRepository.GetAllOrdersAsync();

            return _mapper.Map<IEnumerable<OrderDto>>(orders);
        }

        public async Task<OrderDto?> GetOrderForAdminAsync(int orderId)
        {
            var order = await _orderRepository
                .GetOrderWithItemsForAdminAsync(orderId);

            if (order == null)
            {
                return null;
            }

            return _mapper.Map<OrderDto>(order);
        }

        public async Task<OrderDto?> UpdateOrderStatusAsync(int orderId, UpdateOrderStatusDto dto)
        {
            var order = await _orderRepository
                .GetOrderWithItemsForAdminAsync(orderId);

            if (order == null)
            {
                return null;
            }

            order.Status = dto.Status;

            await _orderRepository.UpdateAsync(order);
            await _orderRepository.SaveChangesAsync();

            var updatedOrder = await _orderRepository
                .GetOrderWithItemsForAdminAsync(orderId);

            if (updatedOrder == null)
            {
                return null;
            }

            return _mapper.Map<OrderDto>(updatedOrder);
        }
    }
}
