FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app
EXPOSE 8080
ENV ASPNETCORE_URLS=http://+:8080

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY ["Ecommerce.API/Ecommerce.API.csproj", "Ecommerce.API/"]
RUN dotnet restore "Ecommerce.API/Ecommerce.API.csproj"
COPY . .
WORKDIR "/src/Ecommerce.API"
RUN dotnet build "Ecommerce.API.csproj" --configuration Release --no-restore --output /app/build

FROM build AS publish
RUN dotnet publish "Ecommerce.API.csproj" --configuration Release --no-build --output /app/publish /p:UseAppHost=false

FROM runtime AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "Ecommerce.API.dll"]
