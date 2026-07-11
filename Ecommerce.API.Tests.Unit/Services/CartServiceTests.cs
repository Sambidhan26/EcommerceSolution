using AutoMapper;
using Ecommerce.API.Common.Exceptions;
using Ecommerce.API.DTOs.Cart;
using Ecommerce.API.Models;
using Ecommerce.API.Repositories.Interfaces;
using Ecommerce.API.Services.Implementation;
using FluentAssertions;
using Moq;
using Xunit;

namespace Ecommerce.API.Tests.Unit.Services
{
    public class CartServiceTests
    {
        private const string UserId = "user-1";
        private const int ProductId = 1;

        [Fact]
        public async Task AddToCartAsync_ShouldThrowNotFoundException_WhenProductDoesNotExist()
        {
            var productRepositoryMock = new Mock<IProductRepository>();
            productRepositoryMock
                .Setup(repository => repository.GetByIdAsync(ProductId))
                .ReturnsAsync((Product?)null);

            var service = CreateCartService(productRepositoryMock: productRepositoryMock);

            var act = async () => await service.AddToCartAsync(
                UserId,
                new AddToCartDto
                {
                    ProductId = ProductId,
                    Quantity = 1
                });

            await act.Should()
                .ThrowAsync<NotFoundException>()
                .WithMessage("Product not found.");
        }

        [Fact]
        public async Task AddToCartAsync_ShouldThrowBadRequestException_WhenQuantityExceedsStock()
        {
            var product = CreateProduct();
            var productRepositoryMock = new Mock<IProductRepository>();
            productRepositoryMock
                .Setup(repository => repository.GetByIdAsync(ProductId))
                .ReturnsAsync(product);

            var service = CreateCartService(productRepositoryMock: productRepositoryMock);

            var act = async () => await service.AddToCartAsync(
                UserId,
                new AddToCartDto
                {
                    ProductId = ProductId,
                    Quantity = 10
                });

            await act.Should()
                .ThrowAsync<BadRequestException>()
                .WithMessage("Insufficient stock for product: Logitech G502 X");
        }

        [Fact]
        public async Task AddToCartAsync_ShouldThrowBadRequestException_WhenExistingCartQuantityPlusNewQuantityExceedsStock()
        {
            var product = CreateProduct();
            var cart = CreateCart();
            var existingCartItem = new CartItem
            {
                Id = 1,
                CartId = cart.Id,
                ProductId = ProductId,
                Quantity = 4,
                UnitPrice = product.Price
            };

            var productRepositoryMock = new Mock<IProductRepository>();
            productRepositoryMock
                .Setup(repository => repository.GetByIdAsync(ProductId))
                .ReturnsAsync(product);

            var cartRepositoryMock = new Mock<ICartRepository>();
            cartRepositoryMock
                .Setup(repository => repository.GetCartByUserIdAsync(UserId))
                .ReturnsAsync(cart);

            var cartItemRepositoryMock = new Mock<ICartItemRepository>();
            cartItemRepositoryMock
                .Setup(repository => repository.GetCartItemAsync(cart.Id, ProductId))
                .ReturnsAsync(existingCartItem);

            var service = CreateCartService(
                productRepositoryMock,
                cartRepositoryMock,
                cartItemRepositoryMock);

            var act = async () => await service.AddToCartAsync(
                UserId,
                new AddToCartDto
                {
                    ProductId = ProductId,
                    Quantity = 2
                });

            await act.Should()
                .ThrowAsync<BadRequestException>()
                .WithMessage("Insufficient stock for product: Logitech G502 X");
        }

        [Fact]
        public async Task AddToCartAsync_ShouldAddNewCartItem_WhenProductIsValidAndCartExists()
        {
            var product = CreateProduct();
            var cart = CreateCart();
            var loadedCart = CreateLoadedCart(product);
            var expectedCart = CreateCartDto();

            var productRepositoryMock = new Mock<IProductRepository>();
            productRepositoryMock
                .Setup(repository => repository.GetByIdAsync(ProductId))
                .ReturnsAsync(product);

            var cartRepositoryMock = new Mock<ICartRepository>();
            cartRepositoryMock
                .Setup(repository => repository.GetCartByUserIdAsync(UserId))
                .ReturnsAsync(cart);
            cartRepositoryMock
                .Setup(repository => repository.GetCartWithItemsAsync(UserId))
                .ReturnsAsync(loadedCart);

            var cartItemRepositoryMock = new Mock<ICartItemRepository>();
            cartItemRepositoryMock
                .Setup(repository => repository.GetCartItemAsync(cart.Id, ProductId))
                .ReturnsAsync((CartItem?)null);
            cartItemRepositoryMock
                .Setup(repository => repository.CreateAsync(It.IsAny<CartItem>()))
                .Returns(Task.CompletedTask);
            cartItemRepositoryMock
                .Setup(repository => repository.SaveChangesAsync())
                .Returns(Task.CompletedTask);

            var mapperMock = CreateMapperMock(loadedCart, expectedCart);

            var service = CreateCartService(
                productRepositoryMock,
                cartRepositoryMock,
                cartItemRepositoryMock,
                mapperMock);

            var result = await service.AddToCartAsync(
                UserId,
                new AddToCartDto
                {
                    ProductId = ProductId,
                    Quantity = 2
                });

            result.Should().BeSameAs(expectedCart);
            cartItemRepositoryMock.Verify(
                repository => repository.CreateAsync(
                    It.Is<CartItem>(item =>
                        item.CartId == cart.Id &&
                        item.ProductId == ProductId &&
                        item.Quantity == 2 &&
                        item.UnitPrice == product.Price)),
                Times.Once);
            cartItemRepositoryMock.Verify(
                repository => repository.SaveChangesAsync(),
                Times.Once);
        }

        [Fact]
        public async Task AddToCartAsync_ShouldCreateCartAndAddItem_WhenCartDoesNotExist()
        {
            var product = CreateProduct();
            var loadedCart = CreateLoadedCart(product);
            var expectedCart = CreateCartDto();

            var productRepositoryMock = new Mock<IProductRepository>();
            productRepositoryMock
                .Setup(repository => repository.GetByIdAsync(ProductId))
                .ReturnsAsync(product);

            var cartRepositoryMock = new Mock<ICartRepository>();
            cartRepositoryMock
                .Setup(repository => repository.GetCartByUserIdAsync(UserId))
                .ReturnsAsync((Cart?)null);
            cartRepositoryMock
                .Setup(repository => repository.CreateAsync(It.IsAny<Cart>()))
                .Callback<Cart>(cart => cart.Id = 1)
                .Returns(Task.CompletedTask);
            cartRepositoryMock
                .Setup(repository => repository.SaveChangesAsync())
                .Returns(Task.CompletedTask);
            cartRepositoryMock
                .Setup(repository => repository.GetCartWithItemsAsync(UserId))
                .ReturnsAsync(loadedCart);

            var cartItemRepositoryMock = new Mock<ICartItemRepository>();
            cartItemRepositoryMock
                .Setup(repository => repository.GetCartItemAsync(1, ProductId))
                .ReturnsAsync((CartItem?)null);
            cartItemRepositoryMock
                .Setup(repository => repository.CreateAsync(It.IsAny<CartItem>()))
                .Returns(Task.CompletedTask);
            cartItemRepositoryMock
                .Setup(repository => repository.SaveChangesAsync())
                .Returns(Task.CompletedTask);

            var mapperMock = CreateMapperMock(loadedCart, expectedCart);

            var service = CreateCartService(
                productRepositoryMock,
                cartRepositoryMock,
                cartItemRepositoryMock,
                mapperMock);

            var result = await service.AddToCartAsync(
                UserId,
                new AddToCartDto
                {
                    ProductId = ProductId,
                    Quantity = 2
                });

            result.Should().BeSameAs(expectedCart);
            cartRepositoryMock.Verify(
                repository => repository.CreateAsync(
                    It.Is<Cart>(cart => cart.UserId == UserId)),
                Times.Once);
            cartRepositoryMock.Verify(
                repository => repository.SaveChangesAsync(),
                Times.Once);
            cartItemRepositoryMock.Verify(
                repository => repository.CreateAsync(
                    It.Is<CartItem>(item =>
                        item.CartId == 1 &&
                        item.ProductId == ProductId &&
                        item.Quantity == 2 &&
                        item.UnitPrice == product.Price)),
                Times.Once);
            cartItemRepositoryMock.Verify(
                repository => repository.SaveChangesAsync(),
                Times.Once);
        }

        private static CartService CreateCartService(
            Mock<IProductRepository>? productRepositoryMock = null,
            Mock<ICartRepository>? cartRepositoryMock = null,
            Mock<ICartItemRepository>? cartItemRepositoryMock = null,
            Mock<IMapper>? mapperMock = null)
        {
            return new CartService(
                (cartRepositoryMock ?? new Mock<ICartRepository>()).Object,
                (cartItemRepositoryMock ?? new Mock<ICartItemRepository>()).Object,
                (productRepositoryMock ?? new Mock<IProductRepository>()).Object,
                (mapperMock ?? new Mock<IMapper>()).Object);
        }

        private static Product CreateProduct()
        {
            return new Product
            {
                Id = ProductId,
                Name = "Logitech G502 X",
                Price = 69.99m,
                StockQuantity = 5
            };
        }

        private static Cart CreateCart()
        {
            return new Cart
            {
                Id = 1,
                UserId = UserId
            };
        }

        private static Cart CreateLoadedCart(Product product)
        {
            return new Cart
            {
                Id = 1,
                UserId = UserId,
                CartItems = new List<CartItem>
                {
                    new()
                    {
                        Id = 1,
                        CartId = 1,
                        ProductId = product.Id,
                        Product = product,
                        Quantity = 2,
                        UnitPrice = product.Price
                    }
                }
            };
        }

        private static CartDto CreateCartDto()
        {
            return new CartDto
            {
                Id = 1,
                TotalItems = 2,
                TotalPrice = 139.98m
            };
        }

        private static Mock<IMapper> CreateMapperMock(Cart cart, CartDto cartDto)
        {
            var mapperMock = new Mock<IMapper>();
            mapperMock
                .Setup(mapper => mapper.Map<CartDto>(cart))
                .Returns(cartDto);

            return mapperMock;
        }
    }
}
