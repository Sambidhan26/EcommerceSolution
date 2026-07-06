using AutoMapper;
using Ecommerce.API.Common.Exceptions;
using Ecommerce.API.Data;
using Ecommerce.API.DTOs.Cart;
using Ecommerce.API.Models;
using Ecommerce.API.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Ecommerce.API.Services.Implementation
{
    public class CartService : ICartService
    {
        private readonly ApplicationDbContext _context;
        private readonly IMapper _mapper;

        public CartService(
            ApplicationDbContext context,
            IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
        }

        public async Task<CartDto> AddToCartAsync(string userId, AddToCartDto dto)
        {
            if (string.IsNullOrWhiteSpace(userId))
            {
                throw new BadRequestException("User id is required.");
            }

            if (dto.Quantity <= 0)
            {
                throw new BadRequestException("Quantity must be greater than zero.");
            }

            var product = await _context.Products
                .FirstOrDefaultAsync(p => p.Id == dto.ProductId);

            if (product == null)
            {
                throw new NotFoundException("Product not found.");
            }

            if (product.StockQuantity < dto.Quantity)
            {
                throw new BadRequestException("Requested quantity is not available.");
            }

            var cart = await _context.Carts
                .Include(c => c.CartItems)
                    .ThenInclude(ci => ci.Product)
                .FirstOrDefaultAsync(c => c.UserId == userId);

            if (cart == null)
            {
                cart = new Cart
                {
                    UserId = userId,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };

                await _context.Carts.AddAsync(cart);
            }

            var existingItem = cart.CartItems
                .FirstOrDefault(item => item.ProductId == dto.ProductId);

            if (existingItem == null)
            {
                cart.CartItems.Add(new CartItem
                {
                    ProductId = product.Id,
                    Product = product,
                    Quantity = dto.Quantity,
                    UnitPrice = product.Price,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                });
            }
            else
            {
                var newQuantity = existingItem.Quantity + dto.Quantity;

                if (product.StockQuantity < newQuantity)
                {
                    throw new BadRequestException("Requested quantity is not available.");
                }

                existingItem.Quantity = newQuantity;
                existingItem.UnitPrice = product.Price;
                existingItem.UpdatedAt = DateTime.UtcNow;
            }

            cart.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return _mapper.Map<CartDto>(cart);
        }
    }
}
