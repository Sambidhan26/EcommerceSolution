using AutoMapper;
using Ecommerce.API.DTOs.Cart;
using Ecommerce.API.Mapping;
using Ecommerce.API.Models;
using FluentAssertions;
using Xunit;

namespace Ecommerce.API.Tests.Unit.Mapping
{
    public class MappingProfileTests
    {
        [Fact]
        public void CartItemMapping_ShouldIncludeProductImageUrl()
        {
            var configuration = new MapperConfiguration(config =>
                config.AddProfile<MappingProfile>());
            var mapper = configuration.CreateMapper();
            var cartItem = new CartItem
            {
                Id = 7,
                ProductId = 12,
                Product = new Product
                {
                    Id = 12,
                    Name = "Mechanical Keyboard",
                    ImageUrl = "/images/products/keyboard.jpg"
                },
                Quantity = 2,
                UnitPrice = 49.50m
            };

            var result = mapper.Map<CartItemDto>(cartItem);

            result.Id.Should().Be(7);
            result.ProductId.Should().Be(12);
            result.ProductName.Should().Be("Mechanical Keyboard");
            result.ImageUrl.Should().Be("/images/products/keyboard.jpg");
            result.Quantity.Should().Be(2);
            result.UnitPrice.Should().Be(49.50m);
            result.SubTotal.Should().Be(99.00m);
        }
    }
}
