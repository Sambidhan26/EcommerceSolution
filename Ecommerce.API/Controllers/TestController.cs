using Ecommerce.API.Models;
using Ecommerce.API.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace Ecommerce.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TestController : ControllerBase
    {
        private readonly IGenericRepository<Category> _repository;

        public TestController(
            IGenericRepository<Category> repository)
        {
            _repository = repository;
        }

        [HttpGet]
        public async Task<IActionResult> Get()
        {
            var categories = await _repository.GetAllAsync();

            return Ok(categories);
        }
    }
}
