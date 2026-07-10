using Ecommerce.API.Models;

namespace Ecommerce.API.Services.Interfaces
{
    public interface IJwtTokenService
    {
         Task<string> GenerateTokenAsync(ApplicationUser user);

         string GenerateRefreshToken();
    }
}
