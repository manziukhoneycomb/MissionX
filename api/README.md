# API - NestJS Clean Architecture

## 📝 Description

This API is built with the powerful [NestJS](https://github.com/nestjs/nest) framework using TypeScript. It strictly adheres to **Clean Architecture** principles, ensuring a clear separation of concerns between domain logic, application rules, and infrastructure details. This approach promotes maintainability, testability, and scalability.

## 📚 Table of Contents

- [📝 Description](#-description)
- [💻 Technologies](#-technologies)
- [📁 Project Structure](#-project-structure)
- [🏛️ Architecture](#️-architecture)
    - [🧩 Domain Layer](#-domain-layer)
    - [⚙️ Application Layer](#️-application-layer)
    - [🧱 Infrastructure Layer](#-infrastructure-layer)
    - [🌐 API Layer](#-api-layer)
- [🗄️ Database Configuration](#️-database-configuration)
- [🔄 Migrations](#-migrations)
- [🧪 Testing](#-testing)
- [🐳 Docker Support](#-docker-support)
    - [Building and Running Docker Containers](#building-and-running-docker-containers)
- [🛠️ Project setup](#️-project-setup)
- [▶️ Compile and run the project](#️-compile-and-run-the-project)
- [📚 Resources](#-resources)

## 💻 Technologies

- **NestJS**: Progressive Node.js framework for building efficient, reliable, and scalable server-side applications.
- **TypeScript**: Typed superset of JavaScript, enhancing code quality and developer productivity.
- **TypeORM**: Object-Relational Mapper (ORM) for seamless database interaction with TypeScript.
- **PostgreSQL**: Robust open-source relational database system.
- **Jest**: Delightful JavaScript testing framework focused on simplicity.
- **Docker**: Platform for developing, shipping, and running applications in containers.

## 📁 Project Structure

This project follows a standard Clean Architecture pattern combined with Domain-Driven Design (DDD) principles. The codebase is organized to reflect the separation of layers:

```
src/
├── api/                    # API layer (controllers, services, NestJS modules)
│   ├── controllers/        # API controllers
│   │   ├── app.controller.spec.ts
│   │   └── app.controller.ts
│   ├── modules/            # NestJS modules
│   │   └── app.module.ts
│   ├── services/           # Application services
│   │   └── app.service.ts
│   └── main.ts             # Application entry point
│
├── application/            # Application layer
│   └── repositories/       # Repository interfaces
│       └── tenant.repository.interface.ts
│
├── domain/                 # Domain layer
│   ├── constants/          # Domain constants
│   │   ├── http-status.enum.ts
│   │   └── index.ts
│   └── entities/           # Domain entities
│       └── tenant.entity.ts
│
└── infrastructure/         # Infrastructure layer
    └── persistence/        # Database related code
        ├── repositories/   # Repository implementations
        │   └── tenant.repository.ts
        ├── persistence.module.ts
        └── typeorm.config.ts
```

## 🏛️ Architecture

This project implements the Clean Architecture pattern, strictly enforcing the **Dependency Rule**: source code dependencies must only point inwards. Outer layers depend on inner layers, but inner layers know nothing about outer layers. The architecture is divided into four primary layers: Domain, Application, Infrastructure, and Presentation.

### 🧩 Domain Layer

- **Location**: `src/domain/`
- **Description**: The absolute heart of the application. It contains the core business logic, rules, and data structures that are fundamental to the business domain.
- **Independence**: This layer **must** be completely independent of any other layer (Application, Infrastructure, Presentation). It should not contain any framework-specific code or external dependencies.
    - **Exception**: Only TypeORM decorators on entity classes are permitted as a pragmatic simplification for defining database mapping metadata directly with the entity. No other external library imports are allowed.
- **Contents**:
    - **Entities**: Core business objects with identity and potentially behavior (can be rich or anemic).
    - **Value Objects**: Immutable objects representing descriptive aspects of the domain without identity (e.g., `Address`, `Money`).
    - **Repository Interfaces (Ports)**: Defines the contracts (interfaces) for data persistence operations. Implementations reside in the Infrastructure layer.
    - **Domain Events**: Represent significant occurrences within the domain.
    - **Domain Exceptions**: Custom exception types representing specific business rule violations or domain errors. They should have meaningful names reflecting business concepts and include relevant context.
    - **Domain Validators**: Logic for enforcing invariants and business rules within entities or value objects.
    - **Constants/Enums**: Domain-specific constants and enumerations.
- **Goal**: Encapsulate enterprise-wide business rules and logic, independent of how the application is delivered or how data is stored.

### ⚙️ Application Layer

- **Location**: `src/application/`
- **Description**: Orchestrates the flow of data and commands to and from the Domain layer to fulfill application-specific use cases. It contains the application logic rather than the core domain logic.
- **Dependencies**: Depends **only** on the Domain layer. It must not have dependencies on the Infrastructure or Presentation layers.
- **Contents**:
    - **Use Cases / Application Services**: Coordinate domain operations and orchestrate workflows to achieve specific application goals.
    - **CQRS Implementation**:
        - **Commands**: Immutable data structures representing an intent to change the system's state (e.g., `CreateTenantCommand`).
        - **Command Handlers**: Process specific commands, interact with domain entities/repositories, and orchestrate domain logic. Each command has a single handler.
        - **Queries**: Represent requests for data retrieval without changing state (e.g., `GetTenantByIdQuery`).
        - **Query Handlers**: Process specific queries, retrieve data (often using repository interfaces), potentially transforming it into DTOs or projections. Each query has a single handler.
    - **Data Transfer Objects (DTOs)**: Used for transferring data between the Presentation layer and the Application layer (input/output). Also used between Application and Infrastructure in some scenarios (e.g., query results).
    - **Repository Interface Usage**: Uses the repository interfaces defined in the Domain layer to interact with data persistence (without knowing the implementation details).
    - **Transaction Management**: Defines boundaries for business transactions.
- **Responsibilities**:
    - Handles domain events raised by the Domain layer.
    - Handles domain exceptions, potentially translating them into application-specific exceptions. Application exceptions should add context and use consistent error codes/messages.
- **Restrictions**: Contains no direct infrastructure dependencies (e.g., no direct database access code, external API client code).

### 🧱 Infrastructure Layer

- **Location**: `src/infrastructure/`
- **Description**: Provides the technical implementations (adapters) for interfaces defined in the inner layers (Domain and Application). It deals with external concerns like databases, external APIs, file systems, etc.
- **Dependencies**: May depend on the Domain and Application layers (to implement their interfaces and use their DTOs/models).
- **Contents**:
    - **Persistence**:
        - **Repository Implementations**: Concrete implementations of the repository interfaces defined in the Domain Layer, using tools like `TypeORM`. Encapsulates all database interaction logic.
        - **Database Configuration**: `TypeORM` connection setup, migrations, entity mapping details (if not solely relying on decorators).
        - **Data Mappers**: (Optional) Logic to map between domain entities and persistence models (e.g., `TypeORM` entities) if they differ significantly.
    - **External Service Clients**: Implementations for interacting with third-party APIs or other external systems.
    - **Caching Implementations**: Concrete caching strategies.
    - **Logging Implementations**: Setup and configuration for logging frameworks.
    - **Other Cross-Cutting Concerns**: Implementations for message queues, email services, etc.
- **Restrictions**: **Must not** contain any business logic. Its sole purpose is to provide technical capabilities.

### 🌐 Presentation Layer (API)

- **Location**: `src/api/`
- **Description**: The outermost layer, responsible for handling interactions with the external world (e.g., users via web browsers, other applications). In this context, it primarily handles HTTP requests and responses.
- **Dependencies**: May depend on the Application layer (to invoke use cases via commands/queries) and uses `DTOs` defined in the Application layer. It should ideally **not** depend directly on the Domain or Infrastructure layers.
- **Contents**:
    - **Controllers**: Receive incoming HTTP requests, parse request bodies/parameters, and validate input (often using `DTOs`).
    - **Routes**: Define the API endpoints and map them to controller actions.
    - **Middleware**: Handles cross-cutting concerns specific to the presentation layer, such as authentication, authorization, request logging, rate limiting.
    - **DTO Mapping**: Maps incoming request data to Application layer `DTOs` and maps Application layer `DTOs`/results back to HTTP responses.
    - **Modules (e.g., NestJS Modules)**: Organize controllers, providers, and related components within the API context.
- **Responsibilities**:
    - Input validation and sanitization.
    - Adapting HTTP requests to Application layer calls (sending commands, dispatching queries).
    - Formatting Application layer results (data or errors) into HTTP responses with appropriate status codes.
    - **Error Handling**: Implements global exception filters to catch exceptions (especially Application layer exceptions) and map them to standardized HTTP error responses with consistent formats and status codes.
- **Restrictions**: **Must not** contain any business logic. It acts as a translator between the HTTP interface and the application's use cases.

## 🗄️ Database Configuration

The application uses PostgreSQL as its database. Configuration is managed through environment variables:

- `DB_HOST`: Database host (default: 'localhost')
- `DB_PORT`: Database port (default: 5432)
- `DB_USERNAME`: Database username (default: 'postgres')
- `DB_PASSWORD`: Database password (default: 'postgres')
- `DB_DATABASE`: Database name (default: 'postgres')
- `DB_SSL`: Whether to use SSL for database connection (default: false)

In development mode, the database schema is automatically synchronized with the entities. For production, you should use migrations.

## 🔄 Migrations

The project includes helper scripts for TypeORM migrations, simplifying database schema management.

```bash
# Generate a new migration based on entity changes
$ npm run migration:generate -- <migration-name>

# Create a new empty migration
$ npm run migration:create -- <migration-name>

# Run all pending migrations
$ npm run migration:run

# Revert the most recently applied migration
$ npm run migration:revert
```

Migrations are stored in `src/infrastructure/persistence/migrations`.

## 🧪 Testing

The project uses Jest for unit and end-to-end testing. Tests are co-located with the code they test (`.spec.ts`) or in the dedicated `test` directory for e2e tests.

```bash
# Run unit tests
$ npm run test

# Run unit tests in watch mode
$ npm run test:watch

# Run unit tests with coverage
$ npm run test:cov

# Run end-to-end tests
$ npm run test:e2e
```

## 🐳 Docker Support

The project includes Docker configurations for consistent development and production environments.

### Building and Running Docker Containers

```bash
# Build and run production container
$ docker build -t api-app .
$ docker run -p 80:80 -p 443:443 api-app

# Build and run development container
$ docker build -f Dockerfile.dev -t api-app-dev .
$ docker run -p 3000:3000 api-app-dev
```

The Docker container exposes ports 80 and 443 for standard HTTP/S traffic.

## 🛠️ Project setup

```bash
$ npm install
```

## ▶️ Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## 📚 Resources

Useful resources for working with NestJS:

- **Documentation**: [NestJS Documentation](https://docs.nestjs.com)
- **Community**: [Discord channel](https://discord.gg/G7Qnnhy)
- **Learning**: Official video [courses](https://courses.nestjs.com/)
- **Tooling**: [NestJS Devtools](https://devtools.nestjs.com)
