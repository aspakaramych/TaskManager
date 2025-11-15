using MainService.Core.Interfaces;
using MainService.Infrastructure.Data;
using MainService.Infrastructure.Repositories;
using MainService.Infrastructure.Services;
using Microsoft.EntityFrameworkCore;
using Scalar.AspNetCore;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddDbContext<AppDbContext>(opt =>
{
    opt.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection"));
});

builder.Services.AddScoped<ISubjectRepository, SubjectRepository>();
builder.Services.AddScoped<ISubjectService, SubjectService>();
builder.Services.AddAuthorization(opt =>
{
    opt.AddPolicy("TeacherOnly", policy => policy.RequireClaim("Teacher"));
});
builder.Services.AddControllers();

builder.Services.AddOpenApi();

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var database = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    database.Database.Migrate();
    database.Database.EnsureCreated();
}

app.UseHttpsRedirection();
app.UseAuthentication();
app.UseAuthorization();
app.MapOpenApi();
app.MapScalarApiReference();
app.MapControllers();

app.Run();