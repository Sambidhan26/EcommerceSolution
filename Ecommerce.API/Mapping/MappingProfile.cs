using AutoMapper;
using Ecommerce.API.DTOs.Category;
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
        }
    }
}
