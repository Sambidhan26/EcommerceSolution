using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using Ecommerce.API.Common;
using Ecommerce.API.DTOs.Auth;
using Ecommerce.API.DTOs.Cart;
using FluentAssertions;
using Xunit;

namespace Ecommerce.API.Tests.Integration
{
    public class ApiIntegrationTests : IClassFixture<CustomWebApplicationFactory>
    {
        private readonly HttpClient _client;

        public ApiIntegrationTests(CustomWebApplicationFactory factory)
        {
            _client = factory.CreateClient();
        }

        [Fact]
        public async Task GetProductFilter_ShouldReturnSuccess()
        {
            var response = await _client.GetAsync("/api/product/filter?pageNumber=1&pageSize=10");

            response.StatusCode.Should().Be(HttpStatusCode.OK);
        }

        [Fact]
        public async Task CustomerToken_ShouldAccessCart()
        {
            var token = await LoginAsync("customer@test.com", "Password123!");
            SetBearerToken(token);

            var addToCartResponse = await _client.PostAsJsonAsync(
                "/api/cart",
                new AddToCartDto
                {
                    ProductId = 1,
                    Quantity = 1
                });

            addToCartResponse.StatusCode.Should().Be(HttpStatusCode.OK);

            var cartResponse = await _client.GetAsync("/api/cart");

            cartResponse.StatusCode.Should().Be(HttpStatusCode.OK);

            var cart = await cartResponse.Content
                .ReadFromJsonAsync<ApiResponse<CartDto>>();

            cart.Should().NotBeNull();
            cart!.Data.Should().NotBeNull();
            cart.Data!.Items.Should().ContainSingle();
            cart.Data.Items[0].ImageUrl.Should()
                .Be("/images/products/logitech-g502-x.jpg");
        }

        [Fact]
        public async Task CustomerToken_ShouldNotAccessAdminOrders()
        {
            var token = await LoginAsync("customer@test.com", "Password123!");
            SetBearerToken(token);

            var response = await _client.GetAsync("/api/admin/orders");

            response.StatusCode.Should().Be(HttpStatusCode.Forbidden);
        }

        [Fact]
        public async Task AddToCart_ShouldReturnBadRequest_WhenQuantityExceedsStock()
        {
            var token = await LoginAsync("customer@test.com", "Password123!");
            SetBearerToken(token);

            var response = await _client.PostAsJsonAsync(
                "/api/cart",
                new AddToCartDto
                {
                    ProductId = 1,
                    Quantity = 9999
                });

            response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
        }

        private async Task<string> LoginAsync(string email, string password)
        {
            var response = await _client.PostAsJsonAsync(
                "/api/auth/login",
                new LoginRequestDto
                {
                    Email = email,
                    Password = password
                });

            response.StatusCode.Should().Be(HttpStatusCode.OK);

            var authResponse = await response.Content.ReadFromJsonAsync<AuthResponseDto>();

            authResponse.Should().NotBeNull();
            authResponse!.Token.Should().NotBeNullOrWhiteSpace();

            return authResponse.Token;
        }

        private void SetBearerToken(string token)
        {
            _client.DefaultRequestHeaders.Authorization =
                new AuthenticationHeaderValue("Bearer", token);
        }
    }
}
