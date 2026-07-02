using Ecommerce.API.Models;
using System.Linq.Expressions;

namespace Ecommerce.API.Services.Interfaces
{
    public interface IGenericRepository<T> where T : BaseEntity
    {
        Task<IEnumerable<T>> GetAllAsync(
             Expression<Func<T, bool>>? filter = null,
             Func<IQueryable<T>, IOrderedQueryable<T>>? orderBy = null,
             string? includeProperties = null);

        Task<T?> GetByIdAsync(int id);

        Task CreateAsync(T entity);

        Task UpdateAsync(T entity);

        Task DeleteAsync(T entity);

        Task<bool> ExistsAsync(int id);

        Task SaveChangesAsync();
    }
}
