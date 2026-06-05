FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY src/PolyglotAPI/PolyglotAPI.csproj src/PolyglotAPI/
RUN dotnet restore src/PolyglotAPI/PolyglotAPI.csproj
COPY src/ src/
WORKDIR /src/src/PolyglotAPI
RUN dotnet publish -c Release -o /app/publish

FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app
COPY --from=build /app/publish .
EXPOSE 8080
ENV ASPNETCORE_URLS=http://+:8080
ENTRYPOINT ["dotnet", "PolyglotAPI.dll"]
