namespace Ecommerce.API.DTOs.Product
{
    public class UploadProductImageDto
    {
        public IFormFile File { get; set; } = default!;
    }
}
