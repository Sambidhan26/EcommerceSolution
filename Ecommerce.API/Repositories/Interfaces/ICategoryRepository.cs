using Ecommerce.API.Models;
using Ecommerce.API.Services.Interfaces;

namespace Ecommerce.API.Repositories.Interfaces
{
    public interface ICategoryRepository : IGenericRepository<Category>
    {
        Task<bool> ExistsByNameAsync(string name);
    }
}
