using Microsoft.AspNetCore.Mvc;
using PolyglotAPI.Controllers;
using PolyglotAPI.Models;
using Xunit;

namespace PolyglotAPI.Tests;

public class StatusControllerTests
{
    [Fact]
    public void Get_ReturnsOkWithStatusObject()
    {
        var controller = new StatusController();
        var result = controller.Get() as OkObjectResult;

        Assert.NotNull(result);
        Assert.Equal(200, result!.StatusCode);

        var body = result.Value;
        Assert.NotNull(body);
    }
}

public class TasksControllerTests
{
    [Fact]
    public async Task Create_ReturnsCreatedTask()
    {
        var controller = new TasksController(redis: null);
        var input = new TaskItem { Title = "Test Task" };

        var result = await controller.Create(input) as CreatedAtActionResult;

        Assert.NotNull(result);
        Assert.Equal(201, result!.StatusCode);

        var task = result.Value as TaskItem;
        Assert.NotNull(task);
        Assert.Equal("Test Task", task!.Title);
        Assert.Equal("pending", task.Status);
    }

    [Fact]
    public async Task GetAll_ReturnsOk()
    {
        var controller = new TasksController(redis: null);
        var result = await controller.GetAll() as OkObjectResult;

        Assert.NotNull(result);
        Assert.Equal(200, result!.StatusCode);
    }

    [Fact]
    public void GetById_ReturnsNotFound_ForMissingId()
    {
        var controller = new TasksController(redis: null);
        var result = controller.GetById(99999);

        Assert.IsType<NotFoundResult>(result);
    }
}
