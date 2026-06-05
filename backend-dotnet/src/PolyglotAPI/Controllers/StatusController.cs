using Microsoft.AspNetCore.Mvc;

namespace PolyglotAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class StatusController : ControllerBase
{
    [HttpGet]
    public IActionResult Get()
    {
        return Ok(new
        {
            status = "ok",
            version = "1.0.0",
            message = "Polyglot Cloud Migration API is running",
            timestamp = DateTime.UtcNow,
            service = ".NET Backend API"
        });
    }
}
