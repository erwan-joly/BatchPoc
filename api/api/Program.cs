using HotChocolate.AspNetCore;
using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.DependencyInjection;

var builder = WebApplication.CreateBuilder(args);

builder.Services
    .AddGraphQLServer()
    .AddMutationType<Mutation>()
    .AddQueryType<Query>();

builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(builder =>
    {
        builder.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader();
    });
});

var app = builder.Build();
app.UseCors();
app.MapGraphQL().WithOptions(
    new GraphQLServerOptions
    {
        EnableBatching = true,
        EnableMultipartRequests = true
    });

app.Run();