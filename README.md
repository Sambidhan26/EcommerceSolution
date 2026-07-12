# Ecommerce.API

Ecommerce.API is a portfolio-ready ASP.NET Core Web API for an e-commerce backend. It demonstrates a layered API architecture with authentication, authorization, product catalog management, cart workflows, checkout, order management, automated tests, CI, and Docker-based local infrastructure.

The project is built with maintainability in mind: controllers remain thin, business rules live in services, data access is handled through repositories, DTOs isolate API contracts, AutoMapper handles object mapping, and global middleware provides consistent error responses.

## Tech Stack

- ASP.NET Core Web API (.NET 8)
- SQL Server
- Entity Framework Core
- ASP.NET Core Identity
- JWT authentication
- Refresh tokens
- Role-based authorization
- Repository pattern
- Service layer
- DTOs and AutoMapper
- Custom exception middleware
- Reusable `ApiResponse<T>` wrapper
- Swagger / OpenAPI with JWT Bearer support
- xUnit, Moq, FluentAssertions
- `WebApplicationFactory<Program>` integration tests
- GitHub Actions CI
- Docker and Docker Compose

## Features

- User registration and login
- JWT access token authentication
- Refresh token generation, rotation, and revocation
- Admin and Customer roles
- Category CRUD
- Product CRUD
- Product filtering, searching, sorting, and pagination
- Product image upload to `wwwroot/images/products`
- Cart management
- Checkout workflow
- Transaction-safe order creation
- Stock validation during checkout
- Stock deduction after successful checkout
- Customer order history
- Admin order management
- Admin order status updates
- Order status transition validation
- Global exception handling for known business errors
- Consistent success responses using `ApiResponse<T>`
- Unit and integration test coverage
- CI pipeline for build and test validation
- Dockerized API and SQL Server local environment

## Architecture

The project follows a clean layered structure:

- **Controllers** receive HTTP requests, validate authentication context, and return API responses.
- **Services** contain business rules such as stock validation, checkout behavior, cart updates, and order status transitions.
- **Repositories** isolate EF Core queries and persistence logic.
- **DTOs** define request and response contracts.
- **AutoMapper** maps entities to DTOs and request DTOs to entities.
- **Middleware** centralizes exception handling and response formatting for errors.
- **Identity + JWT** handles authentication and role-based authorization.

This keeps the API easier to test, extend, and reason about as features grow.

## Folder Structure

```text
EcommerceSolution/
+-- Ecommerce.API/
|   +-- Common/
|   |   +-- Exceptions/
|   |   +-- ApiResponse.cs
|   |   +-- PagedResult.cs
|   |   +-- PaginationParams.cs
|   |   +-- ProductFilterParams.cs
|   +-- Configurations/
|   +-- Controllers/
|   +-- Data/
|   +-- DTOs/
|   +-- Mapping/
|   +-- Middleware/
|   +-- Migrations/
|   +-- Models/
|   +-- Repositories/
|   +-- Services/
|   +-- wwwroot/
|   +-- Dockerfile
|   +-- Program.cs
+-- Ecommerce.API.Tests.Unit/
+-- Ecommerce.API.Tests.Integration/
+-- .github/workflows/ci.yml
+-- docker-compose.yml
+-- .dockerignore
+-- EcommerceSolution.sln
```

## Authentication and Roles

The API uses ASP.NET Core Identity for user management and JWT Bearer authentication for protected endpoints.

Supported roles:

- **Customer**: Can manage cart, checkout, and view personal orders.
- **Admin**: Can manage categories, products, product images, all orders, and order statuses.

JWT tokens are passed in the `Authorization` header:

```text
Authorization: Bearer <access-token>
```

Swagger is configured with JWT support. In Swagger UI, use the **Authorize** button and enter the JWT token only, without the `Bearer` prefix.

## API Endpoints Summary

### Auth

| Method | Endpoint | Description |
| --- | --- | --- |
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Login and receive access/refresh tokens |
| POST | `/api/auth/refresh-token` | Rotate refresh token and receive a new access token |
| POST | `/api/auth/revoke-token` | Revoke a refresh token |

### Categories

| Method | Endpoint | Role | Description |
| --- | --- | --- | --- |
| GET | `/api/category` | Public | Get all categories |
| GET | `/api/category/{id}` | Public | Get category by ID |
| POST | `/api/category` | Admin | Create category |
| PUT | `/api/category/{id}` | Admin | Update category |
| DELETE | `/api/category/{id}` | Admin | Delete category |

### Products

| Method | Endpoint | Role | Description |
| --- | --- | --- | --- |
| GET | `/api/product` | Public | Get all products |
| GET | `/api/product/{id}` | Public | Get product by ID |
| GET | `/api/product/paged` | Public | Get paginated products |
| GET | `/api/product/filter` | Public | Filter, search, sort, and paginate products |
| GET | `/api/product/search?keyword=value` | Public | Search products |
| GET | `/api/product/featured` | Public | Get featured products |
| GET | `/api/product/category/{categoryId}` | Public | Get products by category |
| POST | `/api/product` | Admin | Create product |
| PUT | `/api/product/{id}` | Admin | Update product |
| DELETE | `/api/product/{id}` | Admin | Delete product |
| POST | `/api/product/{id}/image` | Admin | Upload product image |

### Cart

| Method | Endpoint | Role | Description |
| --- | --- | --- | --- |
| POST | `/api/cart` | Customer | Add product to cart |
| GET | `/api/cart` | Customer | Get current user's cart |
| PUT | `/api/cart/items/{cartItemId}` | Customer | Update cart item quantity |
| DELETE | `/api/cart/items/{cartItemId}` | Customer | Remove cart item |
| DELETE | `/api/cart` | Customer | Clear cart |

### Orders

| Method | Endpoint | Role | Description |
| --- | --- | --- | --- |
| POST | `/api/orders/checkout` | Customer | Checkout current cart |
| GET | `/api/orders` | Customer | Get current user's orders |
| GET | `/api/orders/{orderId}` | Customer | Get current user's order by ID |

### Admin Orders

| Method | Endpoint | Role | Description |
| --- | --- | --- | --- |
| GET | `/api/admin/orders` | Admin | Get all orders |
| GET | `/api/admin/orders/{orderId}` | Admin | Get order by ID |
| PUT | `/api/admin/orders/{orderId}/status` | Admin | Update order status |

## How to Run Locally Without Docker

### Prerequisites

- .NET 8 SDK
- SQL Server
- EF Core CLI tools

Install EF Core tools if needed:

```bash
dotnet tool install --global dotnet-ef
```

### Configure local settings

Update the local connection string and JWT settings through `appsettings.json`, user secrets, or environment variables.

For real deployments, do not commit production secrets. Use a secret manager, CI/CD secrets, or environment variables.

### Restore, build, migrate, and run

```bash
dotnet restore
dotnet build
dotnet ef database update --project Ecommerce.API --startup-project Ecommerce.API
dotnet run --project Ecommerce.API
```

When running in Development, Swagger is available at:

```text
https://localhost:<port>/swagger
```

or the HTTP port printed by `dotnet run`.

## How to Run With Docker

The repository includes Docker support for the API and SQL Server.

```bash
docker compose up --build
```

The API runs at:

```text
http://localhost:8080
```

Swagger runs at:

```text
http://localhost:8080/swagger
```

The Docker Compose setup is intended for local development only. Replace development passwords and JWT values before using any production-like environment.

## Database Migration Commands

Create a new migration:

```bash
dotnet ef migrations add MigrationName --project Ecommerce.API --startup-project Ecommerce.API
```

Apply migrations:

```bash
dotnet ef database update --project Ecommerce.API --startup-project Ecommerce.API
```

Remove the last migration before it is applied:

```bash
dotnet ef migrations remove --project Ecommerce.API --startup-project Ecommerce.API
```

## Running Tests

Run all tests:

```bash
dotnet test
```

Run unit tests only:

```bash
dotnet test Ecommerce.API.Tests.Unit
```

Run integration tests only:

```bash
dotnet test Ecommerce.API.Tests.Integration
```

The test suite uses:

- xUnit
- Moq
- FluentAssertions
- EF Core InMemory database
- `WebApplicationFactory<Program>` for integration tests

## GitHub Actions CI

The repository includes a GitHub Actions workflow at:

```text
.github/workflows/ci.yml
```

The CI pipeline runs on pushes and pull requests to `main` and `master`.

It performs:

1. Repository checkout
2. .NET SDK setup
3. Dependency restore
4. Release build
5. Release test run

## Test Accounts for Local Development

The application seeds roles on startup:

- `Admin`
- `Customer`

The application also seeds a development admin user:

| Role | Email | Password |
| --- | --- | --- |
| Admin | `admin@example.com` | `Admin123!` |

These credentials are for local development only. Do not use them in production.

Customer accounts can be created through:

```text
POST /api/auth/register
```

Integration tests also create isolated test users inside the in-memory test database.

## Future Improvements

- Add payment provider integration
- Add order cancellation and refund workflows
- Add email notifications for order updates
- Add product reviews and ratings
- Add wishlist support
- Add inventory audit history
- Add API versioning
- Add rate limiting
- Add structured logging with correlation IDs
- Add health checks for API and SQL Server
- Add production-ready secret management
- Add deployment pipeline for cloud hosting

## Author

**Sambidhan26**

This project is designed as a practical ASP.NET Core Web API e-commerce backend demonstrating authentication, authorization, clean layering, testing, CI, and Docker-based development infrastructure.
