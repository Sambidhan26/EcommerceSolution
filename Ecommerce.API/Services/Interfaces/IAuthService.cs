using Ecommerce.API.DTOs.Auth;

namespace Ecommerce.API.Services.Interfaces
{
    public interface IAuthService
    {
        Task<AuthResponseDto> RegisterAsync(RegisterRequestDto request);

        Task<AuthResponseDto> LoginAsync(LoginRequestDto request);

        Task<AuthResponseDto> RefreshTokenAsync(RefreshTokenRequestDto dto);

        Task<bool> RevokeTokenAsync(RevokeTokenRequestDto dto);
    }
}
