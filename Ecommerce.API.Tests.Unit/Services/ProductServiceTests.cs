using AutoMapper;
using Ecommerce.API.Common.Exceptions;
using Ecommerce.API.DTOs.Product;
using Ecommerce.API.Models;
using Ecommerce.API.Repositories.Interfaces;
using Ecommerce.API.Services.Implementation;
using FluentAssertions;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Moq;
using Xunit;

namespace Ecommerce.API.Tests.Unit.Services
{
    public class ProductServiceTests
    {
        private const int ProductId = 1;
        private const int CategoryId = 2;
        private const string ProductName = "Logitech G502 X";
        private const string CategoryName = "Gaming Mouse";

        [Fact]
        public async Task CreateAsync_ShouldThrowNotFoundException_WhenCategoryDoesNotExist()
        {
            var categoryRepositoryMock = new Mock<ICategoryRepository>();
            categoryRepositoryMock
                .Setup(repository => repository.GetByIdAsync(CategoryId))
                .ReturnsAsync((Category?)null);

            var service = CreateProductService(categoryRepositoryMock: categoryRepositoryMock);

            var act = async () => await service.CreateAsync(CreateProductDto());

            await act.Should()
                .ThrowAsync<NotFoundException>()
                .WithMessage("Category not found.");
        }

        [Fact]
        public async Task CreateAsync_ShouldCreateProduct_WhenCategoryExists()
        {
            var category = CreateCategory();
            var product = CreateProduct();
            var productDto = CreateProductDtoResult();

            var categoryRepositoryMock = new Mock<ICategoryRepository>();
            categoryRepositoryMock
                .Setup(repository => repository.GetByIdAsync(CategoryId))
                .ReturnsAsync(category);

            var productRepositoryMock = new Mock<IProductRepository>();
            productRepositoryMock
                .Setup(repository => repository.CreateAsync(product))
                .Returns(Task.CompletedTask);
            productRepositoryMock
                .Setup(repository => repository.SaveChangesAsync())
                .Returns(Task.CompletedTask);
            productRepositoryMock
                .Setup(repository => repository.GetProductWithCategoryAsync(product.Id))
                .ReturnsAsync(product);

            var mapperMock = new Mock<IMapper>();
            mapperMock
                .Setup(mapper => mapper.Map<Product>(It.IsAny<CreateProductDto>()))
                .Returns(product);
            mapperMock
                .Setup(mapper => mapper.Map<ProductDto>(product))
                .Returns(productDto);

            var service = CreateProductService(
                productRepositoryMock,
                categoryRepositoryMock,
                mapperMock);

            var result = await service.CreateAsync(CreateProductDto());

            result.Should().NotBeNull();
            result.Should().BeSameAs(productDto);
            productRepositoryMock.Verify(
                repository => repository.CreateAsync(product),
                Times.Once);
            productRepositoryMock.Verify(
                repository => repository.SaveChangesAsync(),
                Times.Once);
        }

        [Fact]
        public async Task UpdateAsync_ShouldReturnNull_WhenProductDoesNotExist()
        {
            var productRepositoryMock = new Mock<IProductRepository>();
            productRepositoryMock
                .Setup(repository => repository.GetByIdAsync(ProductId))
                .ReturnsAsync((Product?)null);

            var service = CreateProductService(productRepositoryMock: productRepositoryMock);

            var result = await service.UpdateAsync(ProductId, UpdateProductDto());

            result.Should().BeNull();
        }

        [Fact]
        public async Task UploadProductImageAsync_ShouldReturnNull_WhenProductDoesNotExist()
        {
            var productRepositoryMock = new Mock<IProductRepository>();
            productRepositoryMock
                .Setup(repository => repository.GetByIdAsync(ProductId))
                .ReturnsAsync((Product?)null);

            var service = CreateProductService(productRepositoryMock: productRepositoryMock);

            var result = await service.UploadProductImageAsync(ProductId, CreateFormFile("test.png"));

            result.Should().BeNull();
        }

        [Fact]
        public async Task UploadProductImageAsync_ShouldThrowBadRequestException_WhenFileExtensionIsInvalid()
        {
            var product = CreateProduct();

            var productRepositoryMock = new Mock<IProductRepository>();
            productRepositoryMock
                .Setup(repository => repository.GetByIdAsync(ProductId))
                .ReturnsAsync(product);

            var service = CreateProductService(productRepositoryMock: productRepositoryMock);

            var act = async () => await service.UploadProductImageAsync(
                ProductId,
                CreateFormFile("test.pdf"));

            await act.Should()
                .ThrowAsync<BadRequestException>()
                .WithMessage("Only .jpg, .jpeg, .png, and .webp image files are allowed.");
        }

        private static ProductService CreateProductService(
            Mock<IProductRepository>? productRepositoryMock = null,
            Mock<ICategoryRepository>? categoryRepositoryMock = null,
            Mock<IMapper>? mapperMock = null,
            Mock<IWebHostEnvironment>? environmentMock = null)
        {
            environmentMock ??= new Mock<IWebHostEnvironment>();
            environmentMock
                .Setup(environment => environment.WebRootPath)
                .Returns(Path.GetTempPath());
            environmentMock
                .Setup(environment => environment.ContentRootPath)
                .Returns(Path.GetTempPath());

            return new ProductService(
                (productRepositoryMock ?? new Mock<IProductRepository>()).Object,
                (categoryRepositoryMock ?? new Mock<ICategoryRepository>()).Object,
                (mapperMock ?? new Mock<IMapper>()).Object,
                environmentMock.Object);
        }

        private static CreateProductDto CreateProductDto()
        {
            return new CreateProductDto
            {
                Name = ProductName,
                Price = 69.99m,
                StockQuantity = 5,
                CategoryId = CategoryId
            };
        }

        private static UpdateProductDto UpdateProductDto()
        {
            return new UpdateProductDto
            {
                Name = ProductName,
                Price = 69.99m,
                StockQuantity = 5,
                CategoryId = CategoryId
            };
        }

        private static Product CreateProduct()
        {
            return new Product
            {
                Id = ProductId,
                Name = ProductName,
                Price = 69.99m,
                StockQuantity = 5,
                CategoryId = CategoryId,
                Category = CreateCategory()
            };
        }

        private static Category CreateCategory()
        {
            return new Category
            {
                Id = CategoryId,
                Name = CategoryName
            };
        }

        private static ProductDto CreateProductDtoResult()
        {
            return new ProductDto
            {
                Id = ProductId,
                Name = ProductName,
                Price = 69.99m,
                StockQuantity = 5,
                CategoryId = CategoryId,
                CategoryName = CategoryName
            };
        }

        private static IFormFile CreateFormFile(string fileName)
        {
            var content = "fake file content";
            var stream = new MemoryStream(System.Text.Encoding.UTF8.GetBytes(content));

            return new FormFile(stream, 0, stream.Length, "file", fileName)
            {
                Headers = new HeaderDictionary(),
                ContentType = "application/octet-stream"
            };
        }
    }
}
