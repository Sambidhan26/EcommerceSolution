namespace Ecommerce.API.Common
{
    public class ApiResponse<T>
    {
        public bool Success { get; set; }

        public string Message { get; set; } = string.Empty;

        public T? Data { get; set; }

        public ApiResponse()
        {
        }

        public ApiResponse(
            T? data,
            string message = "Request completed successfully.",
            bool success = true)
        {
            Success = success;
            Message = message;
            Data = data;
        }

        public static ApiResponse<T> SuccessResponse(
            T data,
            string message = "Request completed successfully.")
        {
            return new ApiResponse<T>(data, message);
        }

        public static ApiResponse<T> FailureResponse(string message)
        {
            return new ApiResponse<T>(default, message, false);
        }
    }
}
