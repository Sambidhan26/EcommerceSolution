using AutoMapper;
using Ecommerce.API.DTOs.Cart;
using Ecommerce.API.DTOs.Category;
using Ecommerce.API.DTOs.Order;
using Ecommerce.API.DTOs.Product;
using Ecommerce.API.Models;

namespace Ecommerce.API.Mapping
{
    public class MappingProfile : Profile
    {
        public MappingProfile()
        {
            CreateMap<CreateCategoryDto, Category>();
            CreateMap<UpdateCategoryDto, Category>();
            CreateMap<Category, CategoryDto>();

            CreateMap<CreateProductDto, Product>();
            CreateMap<UpdateProductDto, Product>();
            CreateMap<Product, ProductDto>()
                .ForMember(
                    dest => dest.CategoryName,
                    opt => opt.MapFrom(src => src.Category!.Name));

            CreateMap<CartItem, CartItemDto>()
                .ForMember(
                    dest => dest.ProductName,
                    opt => opt.MapFrom(src => src.Product!.Name))
                .ForMember(
                    dest => dest.SubTotal,
                    opt => opt.MapFrom(src => src.UnitPrice * src.Quantity));

            CreateMap<Cart, CartDto>()
                .ForMember(
                    dest => dest.Items,
                    opt => opt.MapFrom(src => src.CartItems))
                .ForMember(
                    dest => dest.TotalItems,
                    opt => opt.MapFrom(src => src.CartItems.Sum(item => item.Quantity)))
                .ForMember(
                    dest => dest.TotalPrice,
                    opt => opt.MapFrom(src => src.CartItems.Sum(item => item.UnitPrice * item.Quantity)));

            CreateMap<OrderItem, OrderItemDto>()
                .ForMember(
                    dest => dest.ProductName,
                    opt => opt.MapFrom(src => src.Product!.Name))
                .ForMember(
                    dest => dest.SubTotal,
                    opt => opt.MapFrom(src => src.Quantity * src.UnitPrice));
            CreateMap<Order, OrderDto>()
                .ForMember(
                    dest => dest.Items,
                    opt => opt.MapFrom(src => src.OrderItems))
                .ForMember(
                    dest => dest.Status,
                    opt => opt.MapFrom(src => src.Status.ToString()));
        }
    }
}
