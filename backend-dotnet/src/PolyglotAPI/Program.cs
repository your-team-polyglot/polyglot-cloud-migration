var builder = WebApplication.CreateBuilder(args);
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
        policy.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader());
});

var app = builder.Build();
app.UseCors("AllowAll");

var tasks = new List<string> { "Process invoices", "Send daily report", "Sync inventory" };

app.MapGet("/api/status", () => new
{
    status = "ok",
    version = "1.0.0",
    message = "Polyglot API is running",
    timestamp = DateTime.UtcNow
});

app.MapGet("/api/tasks", () => tasks.Select((t, i) => new { id = i + 1, title = t, done = false }));

app.MapPost("/api/tasks", (TaskRequest req) =>
{
    tasks.Add(req.Title);
    return Results.Created($"/api/tasks/{tasks.Count}", new { id = tasks.Count, title = req.Title, done = false });
});

app.Run();

record TaskRequest(string Title);
