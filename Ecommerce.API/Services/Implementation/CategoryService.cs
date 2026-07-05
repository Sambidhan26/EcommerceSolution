using AutoMapper;
using Ecommerce.API.Common.Exceptions;
using Ecommerce.API.DTOs.Category;
using Ecommerce.API.Models;
using Ecommerce.API.Repositories.Interfaces;
using Ecommerce.API.Services.Interfaces;

namespace Ecommerce.API.Services.Implementation
{
    public class CategoryService : ICategoryService
    {
        private readonly ICategoryRepository _repository;
        private readonly IMapper _mapper;

        public CategoryService(
            ICategoryRepository repository,
            IMapper mapper)
        {
            _repository = repository;
            _mapper = mapper;
        }

        public async Task<CategoryDto> CreateAsync(CreateCategoryDto dto)
        {
            if (await _repository.ExistsByNameAsync(dto.Name))
            {
                throw new ConflictException("Category already exists.");
            }

            var category = _mapper.Map<Category>(dto);

            await _repository.CreateAsync(category);
            await _repository.SaveChangesAsync();

            return _mapper.Map<CategoryDto>(category);
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var category = await _repository.GetByIdAsync(id);

            if (category == null)
            {
                return false;
            }

            await _repository.DeleteAsync(category);
            await _repository.SaveChangesAsync();

            return true;
        }

        public async Task<IEnumerable<CategoryDto>> GetAllAsync()
        {
            var categories = await _repository.GetAllAsync(orderBy: q => q.OrderBy(c => c.Name));

            return _mapper.Map<IEnumerable<CategoryDto>>(categories);
        }

        public async Task<CategoryDto?> GetByIdAsync(int id)
        {
            var category = await _repository.GetByIdAsync(id);

            if (category == null)
            {
                return null;
            }

            return _mapper.Map<CategoryDto>(category);
        }

        public async Task<bool> UpdateAsync(int id, UpdateCategoryDto dto)
        {
            var category = await _repository.GetByIdAsync(id);

            if (category == null)
            {
                return false;
            }

            if (await _repository.ExistsByNameAsync(dto.Name) &&
                !string.Equals(category.Name, dto.Name, StringComparison.OrdinalIgnoreCase))
            {
                throw new ConflictException("Category already exists.");
            }

            _mapper.Map(dto, category);

            await _repository.UpdateAsync(category);
            await _repository.SaveChangesAsync();

            return true;
        }
    }
}
