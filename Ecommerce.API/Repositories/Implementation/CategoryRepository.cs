using Ecommerce.API.Data;
using Ecommerce.API.Models;
using Ecommerce.API.Repositories.Interfaces;
using Ecommerce.API.Services.Implementation;
using Microsoft.EntityFrameworkCore;

namespace Ecommerce.API.Repositories.Implementation
{
    public class CategoryRepository : GenericRepository<Category>, ICategoryRepository
    {
        private readonly ApplicationDbContext _context;

        public CategoryRepository(ApplicationDbContext context)
            : base(context)
        {
            _context = context;
        }
        public async Task<bool> ExistsByNameAsync(string name)
        {
            return await _context.Categories.AnyAsync(c => c.Name.ToUpper() == name.ToUpper());
        }
    }
}
