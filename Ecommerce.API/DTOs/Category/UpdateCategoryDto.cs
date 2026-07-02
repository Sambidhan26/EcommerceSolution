using System.ComponentModel.DataAnnotations;

namespace Ecommerce.API.DTOs.Category
{
    public class UpdateCategoryDto
    {
        [Required]
        [StringLength(100)]
        public string Name { get; set; } = string.Empty;
    }
}
