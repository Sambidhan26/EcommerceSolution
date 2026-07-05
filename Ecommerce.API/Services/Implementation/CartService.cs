using AutoMapper;
using Ecommerce.API.DTOs.Cart;
using Ecommerce.API.Models;
using Ecommerce.API.Repositories.Implementation;
using Ecommerce.API.Repositories.Interfaces;
using Ecommerce.API.Services.Interfaces;

namespace Ecommerce.API.Services.Implementation
{
    public class CartService: ICartService
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
                throw new Exception("Product not found.");
            }

            // Step 2: Get User Cart
            var cart = await _cartRepository.GetCartByUserIdAsync(userId);

            // Step 3: Create Cart if it doesn't exist
            if (cart == null)
            {
                cart = new Cart
                {
                    UserId = userId
                };

                await _cartRepository.CreateAsync(cart);
                await _cartRepository.SaveChangesAsync();
            }

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
            return new CartDto
            {
                Id = cart.Id,

                TotalItems = cart.CartItems.Sum(x => x.Quantity),

                TotalPrice = cart.CartItems.Sum(x => x.Quantity * x.UnitPrice),

                Items = cart.CartItems.Select(x => new CartItemDto
                {
                    Id = x.Id,
                    ProductId = x.ProductId,
                    ProductName = x.Product?.Name ?? string.Empty,
                    Quantity = x.Quantity,
                    UnitPrice = x.UnitPrice,
                    SubTotal = x.Quantity * x.UnitPrice
                }).ToList()
            };
        }

        public Task ClearCartAsync(string userId)
        {
            throw new NotImplementedException();
        }

        public Task<CartDto?> GetCartAsync(string userId)
        {
            throw new NotImplementedException();
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
