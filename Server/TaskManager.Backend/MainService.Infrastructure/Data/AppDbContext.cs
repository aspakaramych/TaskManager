using MainService.Core.Entity;
using Microsoft.EntityFrameworkCore;

namespace MainService.Infrastructure.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
        
    }
    
    public DbSet<User> Users { get; set; }
    public DbSet<Project> Projects { get; set; }
    public DbSet<TaskEntity> Tasks { get; set; }
    public DbSet<Team> Teams { get; set; }
    
    public DbSet<PickedTask> PickedTasks { get; set; }
    public DbSet<TeamRole> TeamRoles { get; set; }
    
    public DbSet<TechTask> TechTasks { get; set; }
    
    public DbSet<Subject> Subjects { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<TeamRole>().HasKey(tr => new { tr.TeamId, tr.UserId });
        modelBuilder.Entity<PickedTask>().HasKey(pt => new { pt.TaskId, pt.UserId });

        modelBuilder.Entity<User>()
            .HasMany(u => u.TeamRoles)
            .WithOne(t => t.User)
            .HasForeignKey(t => t.UserId);
        
        modelBuilder.Entity<User>()
            .HasMany(u => u.PickedTasks)
            .WithOne(t => t.User)
            .HasForeignKey(t => t.UserId)
            .OnDelete(DeleteBehavior.Cascade);
        
        modelBuilder.Entity<Team>()
            .HasMany(t => t.TeamRoles)
            .WithOne(t => t.Team)
            .HasForeignKey(t => t.TeamId)
            .OnDelete(DeleteBehavior.Cascade);
        
        modelBuilder.Entity<Project>()
            .HasOne(p => p.ProjectManager)
            .WithOne()
            .HasForeignKey<Project>(p => p.ProjectManagerId);
        
        modelBuilder.Entity<Project>()
            .HasOne(p => p.Team)
            .WithOne(t => t.Project)
            .HasForeignKey<Project>(p => p.TeamId)
            .OnDelete(DeleteBehavior.Cascade);
        
        modelBuilder.Entity<TaskEntity>()
            .HasMany(t => t.Children)
            .WithOne(t => t.TaskEntityHead)
            .HasForeignKey(t => t.TaskHeadId);
        
        modelBuilder.Entity<Project>()
            .HasMany(p => p.Tasks)
            .WithOne(t => t.Project)
            .HasForeignKey(t => t.ProjectId);
        
        modelBuilder.Entity<Subject>()
            .HasOne(s => s.Teacher)
            .WithOne()
            .HasForeignKey<Subject>(s => s.TeacherId);
        
        base.OnModelCreating(modelBuilder);
    }
}