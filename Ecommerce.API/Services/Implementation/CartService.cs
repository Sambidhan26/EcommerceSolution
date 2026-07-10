using AutoMapper;
using Ecommerce.API.Common.Exceptions;
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
            var product = await _productRepository.GetByIdAsync(dto.ProductId);

            if (product == null)
            {
                throw new NotFoundException("Product not found.");
            }

            // Step 2: Reject invalid stock request immediately
            if (dto.Quantity > product.StockQuantity)
            {
                throw new BadRequestException(
                    $"Insufficient stock for product: {product.Name}");
            }

            // Step 3: Get User Cart
            var cart = await _cartRepository.GetCartByUserIdAsync(userId);

            // Step 4: Create Cart if it doesn't exist
            if (cart == null)
            {
                cart = new Cart
                {
                    UserId = userId
                };

                await _cartRepository.CreateAsync(cart);
                await _cartRepository.SaveChangesAsync();
            }

            // Step 5: Check whether product already exists in cart
            var cartItem = await _cartItemRepository
                .GetCartItemAsync(cart.Id, dto.ProductId);

            if (cartItem != null)
            {
                var newQuantity = cartItem.Quantity + dto.Quantity;

                if (newQuantity > product.StockQuantity)
                {
                    throw new BadRequestException(
                        $"Insufficient stock for product: {product.Name}");
                }

                cartItem.Quantity = newQuantity;

                await _cartItemRepository.UpdateAsync(cartItem);
            }
            else
            {
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

            // Step 6: Reload cart with products
            cart = await _cartRepository.GetCartWithItemsAsync(userId);

            if (cart == null)
            {
                throw new BadRequestException("Unable to load cart.");
            }

            return _mapper.Map<CartDto>(cart);
        }

        public async Task<CartDto?> ClearCartAsync(string userId)
        {
            var cart = await _cartRepository.GetCartWithItemsAsync(userId);

            if (cart == null)
            {
                return null;
            }

            foreach (var item in cart.CartItems.ToList())
            {
                await _cartItemRepository.DeleteAsync(item);
            }

            await _cartItemRepository.SaveChangesAsync();

            cart = await _cartRepository.GetCartWithItemsAsync(userId);

            if (cart == null)
            {
                return null;
            }

            return _mapper.Map<CartDto>(cart);
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

        public async Task<CartDto?> RemoveCartItemAsync( string userId, int cartItemId)
        {
            var cartItem = await _cartItemRepository
                .GetCartItemWithCartAsync(cartItemId);

            if (cartItem == null)
            {
                return null;
            }

            if (cartItem.Cart == null ||
                cartItem.Cart.UserId != userId)
            {
                throw new UnauthorizedAccessException(
                    "You are not allowed to modify this cart.");
            }

            await _cartItemRepository.DeleteAsync(cartItem);
            await _cartItemRepository.SaveChangesAsync();

            var cart = await _cartRepository
                .GetCartWithItemsAsync(userId);

            if (cart == null)
            {
                return null;
            }

            return _mapper.Map<CartDto>(cart);
        }

        public async Task<CartDto?> UpdateCartItemAsync(string userId,int cartItemId,UpdateCartItemDto dto)
        {
            var cartItem = await _cartItemRepository
                .GetCartItemWithCartAsync(cartItemId);

            if (cartItem == null)
            {
                return null;
            }

            if (cartItem.Cart == null || cartItem.Cart.UserId != userId)
            {
                throw new UnauthorizedAccessException(
                    "You are not allowed to modify this cart.");
            }

            cartItem.Quantity = dto.Quantity;

            await _cartItemRepository.UpdateAsync(cartItem);
            await _cartItemRepository.SaveChangesAsync();

            var cart = await _cartRepository
                .GetCartWithItemsAsync(userId);

            if (cart == null)
            {
                return null;
            }

            return _mapper.Map<CartDto>(cart);
        }
    }
}
