using AutoMapper;
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
                throw new InvalidOperationException(
                    "Category already exists.");
            }

            var category = _mapper.Map<Category>(dto);

            await _repository.CreateAsync(category);

            await _repository.SaveChangesAsync();

            return _mapper.Map<CategoryDto>(category);
        }

        public Task<bool> DeleteAsync(int id)
        {
            throw new NotImplementedException();
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
                return null;

            return _mapper.Map<CategoryDto>(category);
        }

        public Task<bool> UpdateAsync(int id, UpdateCategoryDto dto)
        {
            throw new NotImplementedException();
        }
    }
}
