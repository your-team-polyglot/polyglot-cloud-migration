using Microsoft.AspNetCore.Mvc;
using PolyglotAPI.Models;
using StackExchange.Redis;
using System.Text.Json;

namespace PolyglotAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TasksController : ControllerBase
{
    private static readonly List<TaskItem> _tasks = new();
    private static int _nextId = 1;
    private readonly IConnectionMultiplexer? _redis;

    public TasksController(IConnectionMultiplexer? redis = null)
    {
        _redis = redis;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        if (_redis is not null)
        {
            var db = _redis.GetDatabase();
            var keys = _redis.GetServer(_redis.GetEndPoints().First())
                             .Keys(pattern: "task:*")
                             .ToArray();
            var items = new List<TaskItem>();
            foreach (var key in keys)
            {
                var val = await db.StringGetAsync(key);
                if (!val.IsNullOrEmpty)
                    items.Add(JsonSerializer.Deserialize<TaskItem>(val!)!);
            }
            return Ok(items);
        }
        return Ok(_tasks);
    }

    [HttpGet("{id}")]
    public IActionResult GetById(int id)
    {
        var task = _tasks.FirstOrDefault(t => t.Id == id);
        if (task is null) return NotFound();
        return Ok(task);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] TaskItem input)
    {
        var task = new TaskItem
        {
            Id = _nextId++,
            Title = input.Title,
            Status = "pending",
            CreatedAt = DateTime.UtcNow
        };
        _tasks.Add(task);

        if (_redis is not null)
        {
            var db = _redis.GetDatabase();
            await db.StringSetAsync($"task:{task.Id}", JsonSerializer.Serialize(task));
            await db.ListRightPushAsync("task_queue", JsonSerializer.Serialize(task));
        }

        return CreatedAtAction(nameof(GetById), new { id = task.Id }, task);
    }

    [HttpDelete("{id}")]
    public IActionResult Delete(int id)
    {
        var task = _tasks.FirstOrDefault(t => t.Id == id);
        if (task is null) return NotFound();
        _tasks.Remove(task);
        return NoContent();
    }
}
