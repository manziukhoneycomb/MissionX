# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### API (NestJS)
```bash
cd api
npm run start:dev        # Start API in development mode with linting and watching
npm run start:dev:debug  # Start API in debug mode
npm run build           # Build the API
npm run lint            # Lint TypeScript files
npm run test            # Run unit tests
npm run test:e2e        # Run end-to-end tests
npm run test:cov        # Run tests with coverage
```

### Client (React)
```bash
cd client
npm run dev             # Start client in development mode with linting
npm run build          # Build the client
npm run lint           # Lint TypeScript/TSX files
npm run test           # Run unit tests
```

### Landing (React SSR)
```bash
cd landing
npm run dev:ssr        # Start landing page in SSR development mode
npm run build:ssr     # Build SSR version
npm run start         # Run production SSR server
```

### Docker Development
```bash
docker-compose up      # Start all services (api:5000, client:3000, landing:3001, db:5432)
```

### Database Migrations
```bash
cd api
npm run migration:generate -- MigrationName  # Generate new migration
npm run migration:run                        # Run pending migrations
npm run migration:revert                     # Revert last migration
```

## Architecture Overview

This is a multi-tenant enterprise application with clean architecture principles:

### Backend (NestJS - Clean Architecture)
- **API Layer** (`src/api/`): Controllers and HTTP-specific logic
- **Application Layer** (`src/application/`): Business logic, services, DTOs, and use cases
- **Domain Layer** (`src/domain/`): Core entities, enums, constants, and business rules
- **Infrastructure Layer** (`src/infrastructure/`): External concerns (database, auth, LLM integration, secrets management)

Key modules:
- **Multi-tenancy**: Tenant middleware applies to all routes, segregating data by tenant
- **Authentication**: Clerk-based auth with role-based access control
- **Invoice Management**: AI-powered invoice processing and data extraction
- **LLM Integration**: OpenAI integration with MCP (Model Context Protocol) support
- **Secrets Management**: Multi-provider support (AWS Secrets Manager, Azure Key Vault, local storage)

### Frontend (React)
- **Client App**: Main application UI using Material-UI, React Query, and Zustand for state management
- **Landing Page**: Marketing site with SSR using Vite and Express
- **Authentication**: Clerk integration for user management
- **State Management**: Zustand stores for complex state, React Query for server state

### Key Technologies
- **Backend**: NestJS, TypeORM, PostgreSQL, Sentry, OpenAI SDK
- **Frontend**: React 19, Material-UI, Zustand, React Query, Clerk
- **Infrastructure**: Docker, Azure Pipelines, Terraform (AWS/Azure)
- **AI/LLM**: OpenAI integration, Model Context Protocol (MCP)

## Code Style Guidelines

The project follows strict TypeScript conventions defined in `.cursor/rules/code-style.mdc`:

- TypeScript strict mode enabled
- PascalCase for classes, camelCase for variables/functions, kebab-case for files
- No comments (self-documenting code), no abbreviations
- Layer-first organization (api/application/domain/infrastructure)
- Clean architecture with dependency inversion
- Immutable data patterns with readonly properties
- Single responsibility functions with early returns

## Important Notes

- All routes are multi-tenant aware via TenantMiddleware
- Database migrations use custom scripts in `api/scripts/migration.js`
- The application supports both AWS and Azure cloud deployments
- LLM features include invoice data extraction and chat functionality
- Role-based access control is implemented throughout the system