using AutoMapper;
using Ecommerce.API.Common.Exceptions;
using Ecommerce.API.Data;
using Ecommerce.API.DTOs.Order;
using Ecommerce.API.Models;
using Ecommerce.API.Repositories.Interfaces;
using Ecommerce.API.Services.Implementation;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Moq;
using Xunit;

namespace Ecommerce.API.Tests.Unit.Services
{
    public class OrderServiceTests
    {
        [Fact]
        public async Task UpdateOrderStatusAsync_ShouldThrowBadRequestException_WhenStatusIsSame()
        {
            var order = new Order
            {
                Id = 1,
                Status = OrderStatus.Pending
            };

            var orderRepositoryMock = new Mock<IOrderRepository>();
            orderRepositoryMock
                .Setup(repository => repository.GetOrderWithItemsForAdminAsync(order.Id))
                .ReturnsAsync(order);

            var service = CreateOrderService(orderRepositoryMock);

            var act = async () => await service.UpdateOrderStatusAsync(
                order.Id,
                new UpdateOrderStatusDto
                {
                    Status = OrderStatus.Pending
                });

            await act.Should()
                .ThrowAsync<BadRequestException>()
                .WithMessage("Order already has this status.");
        }

        [Fact]
        public async Task UpdateOrderStatusAsync_ShouldThrowConflictException_WhenTransitionIsInvalid()
        {
            var order = new Order
            {
                Id = 1,
                Status = OrderStatus.Delivered
            };

            var orderRepositoryMock = new Mock<IOrderRepository>();
            orderRepositoryMock
                .Setup(repository => repository.GetOrderWithItemsForAdminAsync(order.Id))
                .ReturnsAsync(order);

            var service = CreateOrderService(orderRepositoryMock);

            var act = async () => await service.UpdateOrderStatusAsync(
                order.Id,
                new UpdateOrderStatusDto
                {
                    Status = OrderStatus.Pending
                });

            await act.Should()
                .ThrowAsync<ConflictException>()
                .WithMessage("Cannot change order status from Delivered to Pending.");
        }

        [Fact]
        public async Task UpdateOrderStatusAsync_ShouldUpdateStatus_WhenTransitionIsValid()
        {
            var order = new Order
            {
                Id = 1,
                Status = OrderStatus.Pending
            };

            var orderRepositoryMock = new Mock<IOrderRepository>();
            orderRepositoryMock
                .SetupSequence(repository => repository.GetOrderWithItemsForAdminAsync(order.Id))
                .ReturnsAsync(order)
                .ReturnsAsync(order);
            orderRepositoryMock
                .Setup(repository => repository.UpdateAsync(It.IsAny<Order>()))
                .Returns(Task.CompletedTask);
            orderRepositoryMock
                .Setup(repository => repository.SaveChangesAsync())
                .Returns(Task.CompletedTask);

            var service = CreateOrderService(orderRepositoryMock);

            var act = async () => await service.UpdateOrderStatusAsync(
                order.Id,
                new UpdateOrderStatusDto
                {
                    Status = OrderStatus.Processing
                });

            await act.Should().NotThrowAsync();

            order.Status.Should().Be(OrderStatus.Processing);
            orderRepositoryMock.Verify(
                repository => repository.UpdateAsync(
                    It.Is<Order>(updatedOrder => updatedOrder.Status == OrderStatus.Processing)),
                Times.Once);
            orderRepositoryMock.Verify(
                repository => repository.SaveChangesAsync(),
                Times.Once);
        }

        private static OrderService CreateOrderService(Mock<IOrderRepository> orderRepositoryMock)
        {
            var cartRepositoryMock = new Mock<ICartRepository>();
            var cartItemRepositoryMock = new Mock<ICartItemRepository>();
            var mapperMock = new Mock<IMapper>();

            mapperMock
                .Setup(mapper => mapper.Map<OrderDto>(It.IsAny<Order>()))
                .Returns((Order order) => new OrderDto
                {
                    Id = order.Id,
                    Status = order.Status.ToString()
                });

            return new OrderService(
                orderRepositoryMock.Object,
                cartRepositoryMock.Object,
                cartItemRepositoryMock.Object,
                mapperMock.Object,
                CreateDbContext());
        }

        private static ApplicationDbContext CreateDbContext()
        {
            var options = new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseInMemoryDatabase(Guid.NewGuid().ToString())
                .Options;

            return new ApplicationDbContext(options);
        }
    }
}
