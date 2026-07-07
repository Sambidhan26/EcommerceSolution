using AutoMapper;
using Ecommerce.API.DTOs.Cart;
using Ecommerce.API.Models;
using Ecommerce.API.Repositories.Implementation;
using Ecommerce.API.Repositories.Interfaces;
using Ecommerce.API.Services.Interfaces;
using System;

namespace Ecommerce.API.Services.Implementation
{
    public class CartService : ICartService
    {
        private readonly ICartRepository _cartRepository;
        private readonly ICartItemRepository _cartItemRepository;
        private readonly IProductRepository _productRepository;
        private readonly IMapper _mapper;

        public CartService(
            ICartRepository cartRepository,
            ICartItemRepository cartItemRepository,
            IProductRepository productRepository,
            IMapper mapper)
        {
            _cartRepository = cartRepository;
            _cartItemRepository = cartItemRepository;
            _productRepository = productRepository;
            _mapper = mapper;
        }

        public async Task<CartDto> AddToCartAsync(string userId, AddToCartDto dto)
        {
            // Step 1: Verify Product Exists
            Console.WriteLine("Step 1");
            var product = await _productRepository.GetByIdAsync(dto.ProductId);

            if (product == null)
            {
                throw new Exception("Product not found.");
            }

            // Step 2: Get User Cart
            Console.WriteLine("Step 2");
            var cart = await _cartRepository.GetCartByUserIdAsync(userId);

            // Step 3: Create Cart if it doesn't exist
            Console.WriteLine("Step 3");
            if (cart == null)
            {
                cart = new Cart
                {
                    UserId = userId
                };

                await _cartRepository.CreateAsync(cart);
                await _cartRepository.SaveChangesAsync();

                Console.WriteLine($"Cart created with Id = {cart.Id}");
            }
            Console.WriteLine("Step 4");
            // Step 4: Check whether product already exists in cart
            var cartItem = await _cartItemRepository
                .GetCartItemAsync(cart.Id, dto.ProductId);

            if (cartItem != null)
            {
                // Product already exists -> Increase quantity
                cartItem.Quantity += dto.Quantity;

                await _cartItemRepository.UpdateAsync(cartItem);
            }
            else
            {
                // Create new CartItem
                cartItem = new CartItem
                {
                    CartId = cart.Id,
                    ProductId = product.Id,
                    Quantity = dto.Quantity,
                    UnitPrice = product.Price
                };

                await _cartItemRepository.CreateAsync(cartItem);
            }

            await _cartItemRepository.SaveChangesAsync();

            // Step 5: Reload cart with products
            cart = await _cartRepository.GetCartWithItemsAsync(userId);

            if (cart == null)
            {
                throw new Exception("Unable to load cart.");
            }

            // Step 6: Build DTO
            return _mapper.Map<CartDto>(cart);
        }

        public Task ClearCartAsync(string userId)
        {
            throw new NotImplementedException();
        }

        public async Task<CartDto?> GetCartAsync(string userId)
        {
            var cart = await _cartRepository.GetCartWithItemsAsync(userId);

            if (cart == null)
            {
                return null;
            }

            return _mapper.Map<CartDto>(cart);
        }

        public Task RemoveCartItemAsync(string userId, int cartItemId)
        {
            throw new NotImplementedException();
        }

        public Task<CartDto> UpdateCartItemAsync(string userId, int cartItemId, UpdateCartItemDto dto)
        {
            throw new NotImplementedException();
        }
    }
}
