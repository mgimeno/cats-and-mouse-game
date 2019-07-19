using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc;


namespace CatsAndMouseGame.Controllers
{
    [EnableCors("CorsPolicy")]
    [Route("api/[action]")]

    [ApiController]

    public class GameController : ControllerBase
    {
        private readonly IHostingEnvironment _environment;

        public GameController(IHostingEnvironment environment)
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
