using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using CatsAndMouseGame.Hubs;
using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.Extensions.Hosting;
using Microsoft.AspNetCore.Hosting;

namespace CatsAndMouseGame
{
    public class Startup
    {
        public Startup(IConfiguration configuration)
        {
            Configuration = configuration;
        }

        public IConfiguration Configuration { get; }

        // This method gets called by the runtime. Use this method to add services to the container.
        public void ConfigureServices(IServiceCollection services)
        {

            services.Configure<ForwardedHeadersOptions>(options =>
            {
                options.ForwardedHeaders =
                    ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto;
            });

            services.AddCors(options =>
            {
                options.AddPolicy("CorsPolicy",
                   builder =>
                   {
                       builder.AllowAnyMethod()
                                .AllowAnyHeader()
                                .WithOrigins(Configuration.GetSection("WebsiteUrl").Value)
                              .AllowCredentials();
                   });

            }
               );

            services.AddControllers();
            //.AddNewtonsoftJson();

            services.AddSignalR(hubOptions =>
            {
                //hubOptions.SupportedProtocols
            })
                .AddJsonProtocol(options =>
                {
                    options.PayloadSerializerOptions.WriteIndented = false;
                });
            //.AddNewtonsoftJsonProtocol();

        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
        {
            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
            }

            app.UseForwardedHeaders();

            //app.UseWebSockets();

            app.UseRouting();

            app.UseCors("CorsPolicy");

            app.UseEndpoints(endpoints =>
            {
                //endpoints.MapControllers();
                endpoints.MapHub<GameHub>("/gameHub");
                endpoints.MapControllerRoute("default", "{controller=Home}/{action=Index}/{id?}");
            });

        }
    }
}
