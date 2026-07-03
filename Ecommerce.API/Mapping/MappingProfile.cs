using AutoMapper;
using Ecommerce.API.DTOs.Category;
using Ecommerce.API.DTOs.Product;
using Ecommerce.API.Models;

namespace Ecommerce.API.Mapping
{
    public class MappingProfile:Profile
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
        }
    }
}
