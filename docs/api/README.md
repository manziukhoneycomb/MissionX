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
- [🤖 AI & Prompts for Windsurf editor](#-ai--prompts)
- [🤖 AI & Prompts for Cursor editor](#-ai--prompts-for-cursor-editor)
  - [Example Business Logic Prompts](#example-business-logic-prompts)
    - [1. Auth and User Management](#1-auth-and-user-management)
    - [2. Tenant Management](#2-tenant-management)
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

## 🤖 AI & Prompts for Windsurf editor

This section outlines AI rules and prompt guidelines specifically for this API project. These rules should ideally reside in the `.windsurfrules` file located at the root of this `api` directory (`./api/.windsurfrules`).

```markdown
# Project structure

src/
├── api/ # API layer (controllers, services, NestJS modules)
│ ├── controllers/ # API controllers
│ │ ├── app.controller.spec.ts
│ │ └── app.controller.ts
│ ├── modules/ # NestJS modules
│ │ └── app.module.ts
│ ├── services/ # Application services
│ │ └── app.service.ts
│ └── main.ts # Application entry point
│
├── application/ # Application layer
│ └── repositories/ # Repository interfaces
│ └── tenant.repository.interface.ts
│
├── domain/ # Domain layer
│ ├── constants/ # Domain constants
│ │ ├── http-status.enum.ts
│ │ └── index.ts
│ └── entities/ # Domain entities
│ └── tenant.entity.ts
│
└── infrastructure/ # Infrastructure layer
└── persistence/ # Database related code
├── repositories/ # Repository implementations
│ └── tenant.repository.ts
├── persistence.module.ts
└── typeorm.config.ts

# Backend Rules

- Follow clean architecture principles with distinct layers:
  - Domain: Core business logic and domain entities.
  - Application: Use cases and application services.
  - Infrastructure: External dependencies (DB, API).
  - Presentation: HTTP controllers or API gateways.
- Dependencies must always point inward:
  - API → Application → Domain
  - Infrastructure → Application → Domain
  - Domain has no dependencies on other layers
- Use dependency injection to manage services.
- Follow SOLID principles.
- Use DTOs for data transfer between layers.
- Use domain-specific error types to provide meaningful feedback.
- Each feature should have its own module.
- Modules should follow the same layered architecture.
- Use NestJS module system to organize dependencies.

# Domain Layer

- Location: src/domain/ - Contains the core business logic and entities.
- Must be completely independent of other layers.
- No imports from application, infrastructure, or api layers(only TypeORM decorators are allowed for entities to simplify the code).
- Contains pure business logic with no external dependencies.
- Domain entities should be anemic (data-only) or rich (with behavior).
- Use value objects for immutable concepts.
- Define repository interfaces here, not implementations.
- Include domain events, exceptions, and validators.
- Exceptions:
  - Create specific exception types for domain errors.
  - Use meaningful names that reflect business concepts.
  - Include relevant context information.

# Application Layer

- Location: src/application/ - Orchestrates the domain layer to fulfill use cases.
- Depends on Domain layer.
- Contains business rules and workflows.
- Use domain entities and repositories.
- Implement use cases and application services.
- Handle domain events and exceptions.
- Use DTOs for data transfer between layers.
- May depend only on the domain layer.
- Contains use cases, commands, and queries.
- Implements CQRS pattern with command handlers and query handlers:
  - Command Pattern:
    - Use commands for operations that change state.
    - Each command should have a single handler.
    - Commands should be immutable data structures.
    - Command handlers should orchestrate domain operations.
  - Query Pattern:
    - Use queries for operations that read state.
    - Each query should have a single handler.
    - Queries should be optimized for read operations.
    - Consider using projections for complex read models.
- Defines DTOs for input/output data transformation.
- Handles transaction boundaries.
- No direct infrastructure dependencies (database, external APIs).
- Includes application services that coordinate domain operations.
- Exceptions:
  - Handle domain exceptions and translate to application exceptions.
  - Add additional context information if needed.
  - Use consistent error codes and messages.

# Infrastructure Layer

- Location: src/infrastructure/ - Provides implementations for interfaces defined in domain and application layers.
- May depend on domain and application layers.
- Contains repository implementations.
- Use TypeORM or other ORM tools for database access.
- Encapsulate all database operations.
- Implements external service clients.
- Handles caching, logging, and other cross-cutting concerns.
- Uses data mappers to convert between domain entities and application models.
- No business logic should exist here.

# Presentation Layer

- Location: src/api/ - Exposes the application functionality to clients.
- May depend on application and domain layers.
- Contains controllers, routes, and middleware.
- Handles HTTP requests and responses.
- Performs input validation and sanitization.
- Maps DTOs to/from HTTP requests/responses.
- No business logic should exist here.
- Implements proper error handling and status codes.
- Exceptions:
  - Implement global exception filters.
  - Map application exceptions to appropriate HTTP status codes.
  - Provide consistent error response format.

# Testing

- Unit Tests:
  - Focus on testing domain logic in isolation.
  - Mock dependencies using interfaces.
  - Test each use case thoroughly.
- Integration Tests:
  - Test repository implementations against a test database.
  - Verify that infrastructure components work correctly.

# Security Practices

- Authentication and Authorization:
  - Implement in the infrastructure layer.
  - Use guards in the API layer.
  - Keep business logic independent of security concerns.
- Data Validation:
  - Validate input at the API boundary.
  - Use DTOs with class-validator decorators.
  - Implement domain-specific validation in entities.
- Secure Coding:
  - Sanitize all user input.
  - Use parameterized queries.
  - Implement proper CORS configuration.
  - Follow OWASP security guidelines.
```

## 🤖 AI & Prompts for Cursor editor

This section outlines AI rules and prompt guidelines specifically for this API project when using the Cursor editor. All project-based rules should be located in the `.cursor/rules` folder at the root of this `api` directory (`./api/.cursor/rules`).

Currently, there are three rules defined:

1.  **`backend-rules.mdc`**:

    - **Runs**: Always
    - **Description**: Describes the core Clean Architecture principles, layer responsibilities, dependency rules, and technology stack for the backend. It ensures the AI understands where files should be located based on their function (Domain, Application, Infrastructure, Presentation) and adheres to architectural constraints.
    - **Content**:

      ```markdown
      # Technologies

      - NestJS
      - TypeScript
      - TypeORM
      - PostgreSQL
      - Jest

      # Backend Rules

      - Follow clean architecture principles with distinct layers:
        - Domain: Core business logic and domain entities.
        - Application: Use cases and application services.
        - Infrastructure: External dependencies (DB, API).
        - Presentation: HTTP controllers or API gateways.
      - Dependencies must always point inward:
        - API → Application → Domain
        - Infrastructure → Application → Domain
        - Domain has no dependencies on other layers
      - Use dependency injection to manage services.
      - Follow SOLID principles.
      - Use DTOs for data transfer between layers.
      - Use domain-specific error types to provide meaningful feedback.
      - Each feature should have its own module.
      - Modules should follow the same layered architecture.
      - Use NestJS module system to organize dependencies.

      # Domain Layer

      - Location: src/domain/ - Contains the core business logic and entities.
      - Must be completely independent of other layers.
      - No imports from application, infrastructure, or api layers(only TypeORM decorators are allowed for entities to simplify the code).
      - Contains pure business logic with no external dependencies.
      - Domain entities should be anemic (data-only) or rich (with behavior).
      - Use value objects for immutable concepts.
      - Define repository interfaces here, not implementations.
      - Include domain events, exceptions, and validators.
      - Exceptions:
        - Create specific exception types for domain errors.
        - Use meaningful names that reflect business concepts.
        - Include relevant context information.

      # Application Layer

      - Location: src/application/ - Orchestrates the domain layer to fulfill use cases.
      - Depends on Domain layer.
      - Contains business rules and workflows.
      - Use domain entities and repositories.
      - Implement use cases and application services.
      - Handle domain events and exceptions.
      - Use DTOs for data transfer between layers.
      - May depend only on the domain layer.
      - Contains use cases, commands, and queries.
      - Implements CQRS pattern with command handlers and query handlers:
        - Command Pattern:
          - Use commands for operations that change state.
          - Each command should have a single handler.
          - Commands should be immutable data structures.
          - Command handlers should orchestrate domain operations.
        - Query Pattern:
          - Use queries for operations that read state.
          - Each query should have a single handler.
          - Queries should be optimized for read operations.
          - Consider using projections for complex read models.
      - Defines DTOs for input/output data transformation.
      - Handles transaction boundaries.
      - No direct infrastructure dependencies (database, external APIs).
      - Includes application services that coordinate domain operations.
      - Exceptions:
        - Handle domain exceptions and translate to application exceptions.
        - Add additional context information if needed.
        - Use consistent error codes and messages.

      # Infrastructure Layer

      - Location: src/infrastructure/ - Provides implementations for interfaces defined in domain and application layers.
      - May depend on domain and application layers.
      - Contains repository implementations.
      - Use TypeORM or other ORM tools for database access.
      - Encapsulate all database operations.
      - Implements external service clients.
      - Handles caching, logging, and other cross-cutting concerns.
      - Uses data mappers to convert between domain entities and application models.
      - No business logic should exist here.

      # Presentation Layer

      - Location: src/api/ - Exposes the application functionality to clients.
      - May depend on application and domain layers.
      - Contains controllers, routes, and middleware.
      - Handles HTTP requests and responses.
      - Performs input validation and sanitization.
      - Maps DTOs to/from HTTP requests/responses.
      - No business logic should exist here.
      - Implements proper error handling and status codes.
      - Exceptions:
        - Implement global exception filters.
        - Map application exceptions to appropriate HTTP status codes.
        - Provide consistent error response format.

      # Testing

      - Unit Tests:
        - Focus on testing domain logic in isolation.
        - Mock dependencies using interfaces.
        - Test each use case thoroughly.
      - Integration Tests:
        - Test repository implementations against a test database.
        - Verify that infrastructure components work correctly.

      # Security Practices

      - Authentication and Authorization:
        - Implement in the infrastructure layer.
        - Use guards in the API layer.
        - Keep business logic independent of security concerns.
      - Data Validation:
        - Validate input at the API boundary.
        - Use DTOs with class-validator decorators.
        - Implement domain-specific validation in entities.
      - Secure Coding:
        - Sanitize all user input.
        - Use parameterized queries.
        - Implement proper CORS configuration.
        - Follow OWASP security guidelines.
      ```

2.  **`code-style.mdc`**:

    - **Runs**: Always
    - **Description**: Defines code style, formatting guidelines, and naming conventions to ensure consistency across the codebase.
    - **Content**:

      ```markdown
      ---
      description:
      globs:
      alwaysApply: true
      ---

      # Code Style & Formatting

      - Use English for all code and documentation.
      - Use TypeScript only.
      - Embrace Strict mode fully with appropriate compiler option compilerOptions: "strict": true.
      - Use template literals to define URL patterns and others.
      - Use satisfies operator for enforcing type constraints.
      - Prefer exact type matches with 'as const'.
      - Avoid using any and unknown.
      - Avoid mutating parameters
      - Strings should be safe.
      - Use utility types.
      - Always declare the type of each variable and function (parameters and return value).
      - One export per file.
      - Avoid using comments, the code should be self-explanatory.
      - Do not use short-hands.
      - Use spread and destructuring.
      - Put all declarations at the top of the function or class.

      # Naming Conventions

      - Use PascalCase for classes.
      - Use camelCase for variables, functions, and methods.
      - Use kebab-case for file and directory names.
      - Use UPPERCASE for environment variables.
      - Avoid magic numbers / strings and define constants.
      - Use descriptive names that reflect purpose, avoid abbreviations in names.
      - Avoid combining values and functionality in names.

      # Directory Structure

      - Organize by layer first, then by feature
      - Keep related files together
      - Use index files to simplify imports

      # Functions & Logic

      - Keep functions short and single-purpose.
      - Do not use flags as function parameters
      - Avoid deeply nested blocks by:
        - Using early returns.
        - Extracting logic into utility functions.
      - Use higher-order functions (map, filter, reduce) to simplify logic.
      - Use arrow functions for simple cases (<3 instructions), named functions otherwise.
      - Use default parameter values instead of null/undefined checks.
      - Use RO-RO (Receive Object, Return Object) for passing and returning multiple parameters.

      # Data Handling

      - Avoid excessive use of primitive types; encapsulate data in composite types.
      - Avoid placing validation inside functions—use classes with internal validation instead.
      - Prefer immutability for data.
      - Use readonly for immutable properties.
      - Use as const for literals that never change.
      ```

3.  **`project-structure.mdc`**:

    - **Runs**: Conditionally (when the AI needs to understand the project layout)
    - **Description**: Provides a visual representation of the project's directory structure, helping the AI navigate the codebase and place new files correctly.
    - **Content**:

      ```markdown
      ---
      description: Activate this rule when you need to understand the project structure
      globs:
      alwaysApply: false
      ---

      # Project structure

      src/
      ├── api/
      │ ├── controllers/
      │ │ ├── app.controller.spec.ts
      │ │ └── app.controller.ts
      │ ├── modules/
      │ │ └── app.module.ts
      │ ├── services/
      │ │ └── app.service.ts
      │ └── main.ts
      │
      ├── application/
      │ └── repositories/
      │ └── tenant.repository.interface.ts
      │
      ├── domain/
      │ ├── constants/
      │ │ ├── http-status.enum.ts
      │ │ └── index.ts
      │ └── entities/
      │ └── tenant.entity.ts
      │
      └── infrastructure/
      └── persistence/
      ├── repositories/
      │ └── tenant.repository.ts
      ├── persistence.module.ts
      └── typeorm.config.ts
      ```

### Example Business Logic Prompts

- You can copy and paste these prompts into Windsurf/Cursor Cascade to generate user and tenant management logic.
- Feel free to customize the prompts to fit your specific requirements.

#### 1. Auth and User Management

```Markdown
### Authentication Endpoints

#### Use Case: User Registration

- Endpoint: `POST /api/users/register` (or `POST /api/users`)
- Actor: Unauthenticated User
- Goal: To create a new user account in the system.
- Process:
  1.  Actor sends request with a unique login identifier (e.g., email) and password.
  2.  Server validates input (uniqueness, password complexity).
  3.  Server securely hashes the password.
  4.  Server creates a new user record with the default role 'User'.
  5.  Server returns a success response (e.g., 201 Created).
- Authorization: None required.

#### Use Case: User Login

- Endpoint: `POST /api/auth/login`
- Actor: Unauthenticated User
- Goal: To authenticate and obtain a session token (JWT) for accessing protected resources.
- Process:
  1.  Actor sends request with their login identifier and password.
  2.  Server finds the user by identifier.
  3.  Server securely compares the provided password with the stored hash.
  4.  If credentials are valid, the server generates and returns a signed JWT containing user ID, role, and expiration time.
  5.  If credentials are invalid, the server returns an authentication error (e.g., 401 Unauthorized).
- Authorization: None required (to attempt login).

---

### User Management Endpoints (Require Valid JWT)

#### Use Case: Retrieve Own User Profile

- Endpoint: `GET /api/users/me`
- Actor: Authenticated User (any role: User, TenantAdmin, Admin)
- Goal: To retrieve their own profile information.
- Process:
  1.  Actor sends request with their valid JWT in the `Authorization` header.
  2.  Server validates the JWT.
  3.  Server retrieves and returns the profile details associated with the user ID (`sub` claim) from the JWT.
- Authorization: Requires a valid JWT (any role).

#### Use Case: List All Users (Admin)

- Endpoint: `GET /api/users`
- Actor: Admin
- Goal: To retrieve a list of all user accounts in the system.
- Process:
  1.  Actor sends request with their valid Admin JWT.
  2.  Server validates the JWT and verifies the role is `Admin`.
  3.  Server retrieves and returns a list of all user records (potentially with pagination).
- Authorization: Requires a valid JWT with the `Admin` role.

#### Use Case: Get Specific User Details (Admin)

- Endpoint: `GET /api/users/{userId}`
- Actor: Admin
- Goal: To retrieve the complete profile information for a specific user identified by `{userId}`.
- Process:
  1.  Actor sends request with their valid Admin JWT, specifying the target `{userId}` in the path.
  2.  Server validates the JWT and verifies the role is `Admin`.
  3.  Server retrieves and returns the details for the specified user.
- Authorization: Requires a valid JWT with the `Admin` role.

#### Use Case: Update User Details (Admin)

- Endpoint: `PUT /api/users/{userId}` or `PATCH /api/users/{userId}`
- Actor: Admin
- Goal: To modify information (e.g., name, email, role) for a specific user identified by `{userId}`.
- Process:
  1.  Actor sends request with their valid Admin JWT, specifying the target `{userId}` and providing the update data in the request body.
  2.  Server validates the JWT and verifies the role is `Admin`.
  3.  Server updates the specified user record in the database.
  4.  Server returns a success response, potentially with the updated user data.
- Authorization: Requires a valid JWT with the `Admin` role.

#### Use Case: Delete User (Admin)

- Endpoint: `DELETE /api/users/{userId}`
- Actor: Admins
- Goal: To permanently remove a specific user account identified by `{userId}`.
- Process:
  1.  Actor sends request with their valid Admin JWT, specifying the target `{userId}`.
  2.  Server validates the JWT and verifies the role is `Admin`.
  3.  Server deletes the specified user record from the database.
  4.  Server returns a success response (e.g., 204 No Content).
- Authorization: Requires a valid JWT with the `Admin` role.
```

#### 2. Tenant Management

```Markdown
### Tenant Management Endpoints (Require Valid JWT)

#### Use Case: Create a New Tenant
- Endpoint: `POST /api/tenants`
- Actor: Admin
- Goal: To create a new, distinct tenant within the system.
- Process:
    1.  Actor sends request with their valid Admin JWT and tenant details (e.g., name) in the request body.
    2.  Server validates JWT and verifies the `Admin` role.
    3.  Server creates a new tenant record in the database.
    4.  Server returns the details of the newly created tenant (e.g., 201 Created).
- Authorization: Requires a valid JWT with the `Admin` role.

#### Use Case: List Tenants
- Endpoint: `GET /api/tenants`
- Actor: Admin, TenantAdmin
- Goal: To retrieve a list of tenants.
- Process:
    - Admin: Sends request with Admin JWT. Server returns a list of *all* tenants.
    - TenantAdmin: Sends request with TenantAdmin JWT. Server identifies the `tid` from the JWT and returns details for *only that specific tenant*.
- Authorization: Requires a valid JWT with `Admin` role OR `TenantAdmin` role.

#### Use Case: Get Specific Tenant Details
- Endpoint: `GET /api/tenants/{tenantId}`
- Actor: Admin, TenantAdmin
- Goal: To retrieve detailed information about a specific tenant identified by `{tenantId}`.
- Process:
    - Admin: Sends request with Admin JWT and `{tenantId}`. Server returns details for the specified tenant.
    - TenantAdmin: Sends request with TenantAdmin JWT and `{tenantId}`. Server validates the JWT *and* verifies that the requested `{tenantId}` matches the `tid` claim in the JWT. If they match, server returns tenant details; otherwise, returns an authorization error (e.g., 403 Forbidden or 404 Not Found).
- Authorization: Requires a valid JWT with `Admin` role (can access any tenant) OR `TenantAdmin` role (can only access their own tenant).

#### Use Case: Update Tenant Details
- Endpoint: `PUT /api/tenants/{tenantId}` or `PATCH /api/tenants/{tenantId}`
- Actor: Admin, TenantAdmin
- Goal: To modify information (e.g., name) for a specific tenant identified by `{tenantId}`.
- Process:
    - Admin: Sends request with Admin JWT, `{tenantId}`, and update data. Server updates the specified tenant.
    - TenantAdmin: Sends request with TenantAdmin JWT, `{tenantId}`, and update data. Server validates the JWT *and* verifies `{tenantId}` matches the JWT `tid`. If matched, server updates the tenant; otherwise, returns an authorization error.
- Authorization: Requires a valid JWT with `Admin` role (can update any tenant) OR `TenantAdmin` role (can only update their own tenant).

#### Use Case: Delete a Tenant
- Endpoint: `DELETE /api/tenants/{tenantId}`
- Actor: Admin
- Goal: To permanently remove a tenant and potentially associated resources (users within it might be deleted or disassociated based on system policy).
- Process:
    1.  Actor sends request with their valid Admin JWT and the target `{tenantId}`.
    2.  Server validates JWT and verifies the `Admin` role.
    3.  Server deletes the specified tenant record (implementing necessary cascade/cleanup logic).
    4.  Server returns a success response (e.g., 204 No Content).
- Authorization: Requires a valid JWT with the `Admin` role.

---

### Tenant User Management Endpoints (Require Valid JWT)

#### Use Case: Add a User to a Specific Tenant
- Endpoint: `POST /api/tenants/{tenantId}/users`
- Actor: Admin, TenantAdmin
- Goal: To create a new user and associate them directly with the tenant specified by `{tenantId}`.
- Process:
    1.  Actor sends request with their valid JWT, specifying the target `{tenantId}` in the path, and providing user details (login, password, etc.) in the request body.
    2.  Admin: Server validates Admin JWT. Creates the user linked to the specified `{tenantId}`.
    3.  TenantAdmin: Server validates TenantAdmin JWT *and* verifies the `{tenantId}` in the path matches the `tid` claim in the JWT. If matched, creates the user linked to that tenant; otherwise, returns an authorization error.
    4.  Server returns success response, potentially with new user details (e.g., 201 Created).
- Authorization: Requires `Admin` JWT (can add to any tenant) OR `TenantAdmin` JWT (can add *only* to their own tenant).

#### Use Case: List Users Within a Specific Tenant
- Endpoint: `GET /api/tenants/{tenantId}/users`
- Actor: Admin, TenantAdmin
- Goal: To retrieve a list of users belonging to the tenant specified by `{tenantId}`.
- Process:
    1.  Actor sends request with their valid JWT, specifying the target `{tenantId}` in the path.
    2.  Admin: Server validates Admin JWT. Retrieves and returns users linked to the specified `{tenantId}`.
    3.  TenantAdmin: Server validates TenantAdmin JWT *and* verifies the `{tenantId}` in the path matches the `tid` claim in the JWT. If matched, retrieves and returns users for that tenant; otherwise, returns an authorization error.
- Authorization: Requires `Admin` JWT (can list for any tenant) OR `TenantAdmin` JWT (can list *only* for their own tenant).

#### Use Case: Get Specific User Details Within a Tenant
- Endpoint: `GET /api/tenants/{tenantId}/users/{userId}`
- Actor: Admin, TenantAdmin
- Goal: To retrieve details for a specific user (`{userId}`) known to be within a specific tenant (`{tenantId}`).
- Process:
    1.  Actor sends request with their valid JWT, specifying `{tenantId}` and `{userId}` in the path.
    2.  Admin: Server validates Admin JWT. Verifies user `{userId}` exists within tenant `{tenantId}`. Returns user details.
    3.  TenantAdmin: Server validates TenantAdmin JWT, verifies path `{tenantId}` matches JWT `tid`, *and* verifies user `{userId}` exists within that tenant. If all checks pass, returns user details; otherwise, returns an authorization error.
- Authorization: Requires `Admin` JWT (any tenant/user context) OR `TenantAdmin` JWT (only for users within their own tenant).

#### Use Case: Update User Details Within a Tenant
- Endpoint: `PUT /api/tenants/{tenantId}/users/{userId}` or `PATCH /api/tenants/{tenantId}/users/{userId}`
- Actor: Admin, TenantAdmin
- Goal: To modify information for user `{userId}` within tenant `{tenantId}`.
- Process:
    1.  Actor sends request with valid JWT, `{tenantId}`, `{userId}`, and update data.
    2.  Admin: Server validates Admin JWT. Verifies user exists in tenant. Updates the user record.
    3.  TenantAdmin: Server validates TenantAdmin JWT, verifies path `{tenantId}` matches JWT `tid`, *and* verifies user `{userId}` exists within that tenant. If checks pass, updates the user record (potentially with restrictions on fields like 'role'); otherwise, returns an authorization error.
- Authorization: Requires `Admin` JWT (any tenant/user context) OR `TenantAdmin` JWT (only for users within their own tenant).

#### Use Case: Remove User From Tenant / Delete User
- Endpoint: `DELETE /api/tenants/{tenantId}/users/{userId}`
- Actor: Admin, TenantAdmin
- Goal: To remove user `{userId}` from tenant `{tenantId}`. (This might mean disassociation or full deletion depending on system design).
- Process:
    1.  Actor sends request with valid JWT, `{tenantId}`, and `{userId}`.
    2.  Admin: Server validates Admin JWT. Verifies user exists in tenant. Removes/deletes the user based on system policy.
    3.  TenantAdmin: Server validates TenantAdmin JWT, verifies path `{tenantId}` matches JWT `tid`, *and* verifies user `{userId}` exists within that tenant. If checks pass, removes/deletes the user; otherwise, returns an authorization error.
- Authorization: Requires `Admin` JWT (any tenant/user context) OR `TenantAdmin` JWT (only for users within their own tenant).
```

## 📚 Resources

Useful resources for working with NestJS:

- **Documentation**: [NestJS Documentation](https://docs.nestjs.com)
- **Community**: [Discord channel](https://discord.gg/G7Qnnhy)
- **Learning**: Official video [courses](https://courses.nestjs.com/)
- **Tooling**: [NestJS Devtools](https://devtools.nestjs.com)
