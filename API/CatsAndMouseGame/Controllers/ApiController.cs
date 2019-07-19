using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc;


namespace CatsAndMouseGame.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ApiController : ControllerBase
    {
        private readonly IHostingEnvironment _environment;

        public ApiController(IHostingEnvironment environment)
        {
            _environment = environment;
        }

        [HttpGet]
        public IActionResult ApiStatus()
        {
            return Ok($"API IS READY. Environment: {_environment.EnvironmentName}");
        }

    }
}
