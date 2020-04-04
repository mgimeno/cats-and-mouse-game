using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc;


namespace CatsAndMouseGame.Controllers
{
    [EnableCors("CorsPolicy")]
    [Route("api/[action]")]
    [ApiController]

    public class StatusController : ControllerBase
    {
        private readonly IWebHostEnvironment _environment;

        public StatusController(IWebHostEnvironment environment)
        {
            _environment = environment;
        }

        [HttpGet]
        public IActionResult Status()
        {
            return Ok($"API IS READY. Environment: {_environment.EnvironmentName}");
        }

    }
}
