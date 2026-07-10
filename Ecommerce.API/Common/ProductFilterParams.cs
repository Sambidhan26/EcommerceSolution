namespace Ecommerce.API.Common
{
    public class ProductFilterParams : PaginationParams
    {
        public string? Search { get; set; }

        public int? CategoryId { get; set; }

        public bool? IsFeatured { get; set; }

        public string? SortBy { get; set; }

        public string? SortOrder { get; set; }
    }
}
