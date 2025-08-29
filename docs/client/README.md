# 🚀 AI-driven React Template

## 📋 Table of Contents

- [📝 Overview](#overview)
- [🛠️ Technologies Used](#technologies-used)
- [📂 Project Structure](#project-structure)
- [💻 Development](#development)
- [📏 Code Style Guidelines](#code-style-guidelines)
- [🤖 Windsurf Project AI Rules](#windsurf-project-ai-rules)
- [🤖 Cursor Project AI Rules](#cursor-project-ai-rules)
- [🧩 Module Prompts](#module-prompts)

## 📝 Overview

This project is a modern React application built with TypeScript and Vite. It follows a modular architecture with a focus on clean code, type safety, and maintainability.

## 🛠️ Technologies Used

### 🧩 Core

- ⚛️ React 19
- 📘 TypeScript
- ⚡ Vite 6

### 📊 State Management

- 🗃️ Zustand - Lightweight state management
- 🔄 TanStack React Query - Data fetching and caching

### 🎨 UI Framework

- 🧰 Material UI (MUI) - Component library
- 💅 Emotion - CSS-in-JS styling

### 🧭 Routing

- 🔀 React Router DOM 7 - Client-side routing

### 📝 Form Handling

- 📋 Formik - Form management
- ✅ Yup - Schema validation

### 🔧 Development Tools

- 🔍 ESLint - Code linting
- ✨ Prettier - Code formatting
- 🪝 Husky - Git hooks

## 📂 Project Structure

```
/client/
├── 📁 public/
│   ├── 📄 index.html          # Main HTML file
│   ├── favicon.ico
│   └── 📁 assets/             # Public assets (images, icons, etc.)
├── 📁 src/
│   ├── 📁 modules/            # Feature-based modules
│   │   ├── 📁 auth/           # Authentication feature
│   │   │   ├── 📁 components/ # UI components for authentication (e.g., LoginForm, Signup)
│   │   │   │   └── 📄 LoginForm.tsx
│   │   │   ├── 📁 hooks/      # Feature-specific hooks (e.g., useAuth)
│   │   │   │   └── 📄 useAuth.ts
│   │   │   ├── 📁 services/   # API calls and business logic (e.g., authService)
│   │   │   │   └── 📄 authService.ts
│   │   │   ├── 📁 state/      # Zustand store for auth state
│   │   │   │   └── 📄 authStore.ts
│   │   │   ├── 📁 utils/      # Helper functions (e.g., validation rules)
│   │   │   │   └── 📄 validation.ts
│   │   │   └── 📄 index.ts    # Module entry point (optional: re-export module APIs)
│   │   └── 📁 dashboard/      # Dashboard or another feature module
│   │       ├── 📁 components/ # Components for the dashboard (e.g., DashboardView)
│   │       │   └── 📄 DashboardView.tsx
│   │       ├── 📁 hooks/      # Custom hooks (e.g., useDashboard)
│   │       │   └── 📄 useDashboard.ts
│   │       ├── 📁 services/   # Data fetching and business logic (e.g., dashboardService)
│   │       │   └── 📄 dashboardService.ts
│   │       ├── 📁 state/      # Zustand store for dashboard-related state
│   │       │   └── 📄 dashboardStore.ts
│   │       ├── 📁 utils/      # Utilities specific to dashboard
│   │       │   └── 📄 dashboardUtils.ts
│   │       └── 📄 index.ts
│   ├── 📁 common/             # Shared code across modules
│   │   ├── 📁 components/     # Reusable UI components (e.g., Button, Input, Modal)
│   │   │   └── 📄 Button.tsx
│   │   ├── 📁 hooks/          # Generic hooks (e.g., useDebounce)
│   │   │   └── 📄 useDebounce.ts
│   │   └── 📁 utils/          # Common utility functions (e.g., formatDate)
│   │       └── 📄 formatDate.ts
│   ├── 📁 routes/             # Route definitions and configurations
│   │   └── 📄 AppRoutes.tsx
│   ├── 📁 styles/             # Global styles and theming
│   │   ├── 📄 global.css
│   │   └── 📄 theme.ts
│   ├── 📄 App.tsx             # Main app component (layout, routing, etc.)
│   └── 📄 index.tsx           # Entry point (ReactDOM.render)
├── 📄 .env                    # Environment variables
├── 📄 package.json
├── 📄 tsconfig.json           # TypeScript configuration
```

## 💻 Development

### 📋 Prerequisites

- 📦 Node.js (latest LTS version recommended)
- 📦 npm or yarn

### 🚀 Getting Started

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Start the development server:
   ```
   npm run dev
   ```
4. Open your browser and navigate to `http://localhost:5173`

### 📜 Available Scripts

- `npm run dev` - ▶️ Start the development server
- `npm run build` - 🏗️ Build the application for production
- `npm run lint` - 🔍 Run ESLint to check for code issues
- `npm run lint:fix` - 🔧 Fix ESLint issues automatically
- `npm run format` - ✨ Format code with Prettier
- `npm run preview` - 👁️ Preview the production build locally

## 📏 Code Style Guidelines

This project follows strict TypeScript coding standards:

- 🔒 TypeScript strict mode enabled
- 🏷️ Consistent naming conventions (PascalCase for components, camelCase for variables)
- 📄 File and directory names use kebab-case
- 🧩 Modular architecture with clear separation of concerns
- 🛡️ Type safety prioritized throughout the codebase

## 🤖 Windsurf Project AI Rules

```markdown
You are a Senior Front-End Developer and an Expert in ReactJS, JavaScript, TypeScript, HTML, CSS and modern UI/UX frameworks (e.g., Material UI). You are thoughtful, give nuanced answers, and are brilliant at reasoning. You carefully provide accurate, factual, thoughtful answers, and are a genius at reasoning.

- Follow the user's requirements carefully & to the letter.
- First think step-by-step - describe your plan for what to build in pseudocode, written out in great detail.
- Confirm, then write code!
- Fully implement all requested functionality.
- Leave NO todo's, placeholders or missing pieces.
- Ensure code is complete! Verify thoroughly finalised.
- Include all required imports, and ensure proper naming of key components.
- Be concise Minimize any other prose.
- If you think there might not be a correct answer, you say so.
- If you do not know the answer, say so, instead of guessing.

### Coding Environment

The user asks questions about the following coding languages:

- ReactJS
- JavaScript
- TypeScript
- HTML
- CSS
- Zustand
- Material UI (MUI)

### Environment variables

- `.env` - Environment variables
- `VITE_API_URL` - API base URL

### Project structure

/client/
├── public/
│ ├── index.html # Main HTML file
│ ├── favicon.ico
│ └── assets/ # Public assets (images, icons, etc.)
├── src/
│ ├── modules/ # Feature-based modules
│ │ ├── auth/ # Authentication feature
│ │ │ ├── components/ # UI components for authentication (e.g., LoginForm, Signup)
│ │ │ │ └── LoginForm.tsx
│ │ │ ├── hooks/ # Feature-specific hooks (e.g., useAuth)
│ │ │ │ └── useAuth.ts
│ │ │ ├── services/ # API calls and business logic (e.g., authService)
│ │ │ │ └── authService.ts
│ │ │ ├── state/ # Zustand store for auth state
│ │ │ │ └── authStore.ts
│ │ │ ├── utils/ # Helper functions (e.g., validation rules)
│ │ │ │ └── validation.ts
│ │ │ └── index.ts # Module entry point (optional: re-export module APIs)
│ │ └── dashboard/ # Dashboard or another feature module
│ │ ├── components/ # Components for the dashboard (e.g., DashboardView)
│ │ │ └── DashboardView.tsx
│ │ ├── hooks/ # Custom hooks (e.g., useDashboard)
│ │ │ └── useDashboard.ts
│ │ ├── services/ # Data fetching and business logic (e.g., dashboardService)
│ │ │ └── dashboardService.ts
│ │ ├── state/ # Zustand store for dashboard-related state
│ │ │ └── dashboardStore.ts
│ │ ├── utils/ # Utilities specific to dashboard
│ │ │ └── dashboardUtils.ts
│ │ └── index.ts
│ ├── common/ # Shared code across modules
│ │ ├── components/ # Reusable UI components (e.g., Button, Input, Modal)
│ │ │ └── Button.tsx
│ │ ├── hooks/ # Generic hooks (e.g., useDebounce)
│ │ │ └── useDebounce.ts
│ │ └── utils/ # Common utility functions (e.g., formatDate)
│ │ └── formatDate.ts
│ ├── routes/ # Route definitions and configurations
│ │ └── AppRoutes.tsx
│ ├── styles/ # Global styles and theming
│ │ ├── global.css
│ │ └── theme.ts
│ ├── App.tsx # Main app component (layout, routing, etc.)
│ └── index.tsx # Entry point (ReactDOM.render)
├── .env # Environment variables
├── package.json
├── tsconfig.json # TypeScript configuration
```

## 🤖 Cursor Project AI Rules

### code-style.mdc

**Activates for all files**

```markdown
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

# Data Handling

- Avoid excessive use of primitive types; encapsulate data in composite types.
- Avoid placing validation inside functions—use classes with internal validation instead.
- Prefer immutability for data.
- Use readonly for immutable properties.
- Use as const for literals that never change.
```

### material-ui-configuration.mdc

**Activates only for files that import or use MUI components**

```markdown
- The project uses Material UI.
```

### project-structure.mdc

**Activates when working on project architecture or creating new components**

```markdown
### Technologies

- ReactJS
- TypeScript
- HTML
- CSS
- React-query
- Zustand
- Material UI (MUI)
- Formik
- Yup

### Project structure

/client/
├── public/
│ ├── index.html # Main HTML file
│ ├── favicon.ico
│ └── assets/ # Public assets (images, icons, etc.)
├── src/
│ ├── modules/ # Feature-based modules
│ │ ├── auth/ # Authentication feature
│ │ │ ├── components/ # UI components for authentication (e.g., LoginForm, Signup)
│ │ │ │ └── LoginForm.tsx
│ │ │ ├── hooks/ # Feature-specific hooks (e.g., useAuth)
│ │ │ │ └── useAuth.ts
│ │ │ ├── services/ # API calls and business logic (e.g., authService)
│ │ │ │ └── authService.ts
│ │ │ ├── state/ # Zustand store for auth state
│ │ │ │ └── authStore.ts
│ │ │ ├── utils/ # Helper functions (e.g., validation rules)
│ │ │ │ └── validation.ts
│ │ │ └── index.ts # Module entry point (optional: re-export module APIs)
│ │ └── dashboard/ # Dashboard or another feature module
│ │ ├── components/ # Components for the dashboard (e.g., DashboardView)
│ │ │ └── DashboardView.tsx
│ │ ├── hooks/ # Custom hooks (e.g., useDashboard)
│ │ │ └── useDashboard.ts
│ │ ├── services/ # Data fetching and business logic (e.g., dashboardService)
│ │ │ └── dashboardService.ts
│ │ ├── state/ # Zustand store for dashboard-related state
│ │ │ └── dashboardStore.ts
│ │ ├── utils/ # Utilities specific to dashboard
│ │ │ └── dashboardUtils.ts
│ │ └── index.ts
│ ├── common/ # Shared code across modules
│ │ ├── components/ # Reusable UI components (e.g., Button, Input, Modal)
│ │ │ └── Button.tsx
│ │ ├── hooks/ # Generic hooks (e.g., useDebounce)
│ │ │ └── useDebounce.ts
│ │ └── utils/ # Common utility functions (e.g., formatDate)
│ │ └── formatDate.ts
│ ├── routes/ # Route definitions and configurations
│ │ └── AppRoutes.tsx
│ ├── styles/ # Global styles and theming
│ │ ├── global.css
│ │ └── theme.ts
│ ├── App.tsx # Main app component (layout, routing, etc.)
│ └── index.tsx # Entry point (ReactDOM.render)
├── .env # Environment variables
├── package.json
├── tsconfig.json # TypeScript configuration
```

### react.mdc

**Activates for all React component files (.tsx)**

```markdown
## Component Structure

- Use functional components over class components
- Keep components small and focused
- Extract reusable logic into custom hooks
- Use composition over inheritance
- Implement proper prop types with TypeScript
- Split large components into smaller, focused ones

## Hooks

- Follow the Rules of Hooks
- Use custom hooks for reusable logic
- Keep hooks focused and simple
- Use appropriate dependency arrays in useEffect
- Implement cleanup in useEffect when needed
- Avoid nested hooks

## State Management

- Use useState for local component state
- Use zustand for global state management
- Avoid prop drilling through proper state management

## Performance

- Implement proper memoization (useMemo, useCallback)
- Use React.memo for expensive components
- Avoid unnecessary re-renders
- Implement proper lazy loading
- Use proper key props in lists
- Profile and optimize render performance

## Forms

- Use controlled components for form inputs
- Implement proper form validation
- Handle form submission states properly
- Show appropriate loading and error states
- Use form libraries for complex forms
- Implement proper accessibility for forms

## Error Handling

- Implement Error Boundaries
- Handle async errors properly
- Show user-friendly error messages
- Implement proper fallback UI
- Log errors appropriately
- Handle edge cases gracefully

## Testing

- Write unit tests for components
- Implement integration tests for complex flows
- Use React Testing Library
- Test user interactions
- Test error scenarios
- Implement proper mock data

## Accessibility

- Use semantic HTML elements
- Implement proper ARIA attributes
- Ensure keyboard navigation
- Test with screen readers
- Handle focus management
- Provide proper alt text for images

## Code Organization

- Group related components together
- Use proper file naming conventions
- Implement proper directory structure
- Keep styles close to components
- Use proper imports/exports
- Document complex component logic
```

### zustand.mdc

**Activates for all store files (\*Store.ts) managing application state**

```markdown
## Zustand rules

- Ensure immutability: Always return new state objects or arrays when updating state, never mutate the existing state directly.
- Use selectors for performance: Subscribe components only to the specific state slices they need, rather than the whole store, to prevent unnecessary re-renders.
- Split complex state: Avoid monolithic stores by breaking down state into smaller, logical stores based on domain or feature.
- Define actions within the store: Keep state update logic encapsulated within the create function alongside the state it modifies.
- Leverage middleware: Utilize middleware like persist for local storage synchronization.
- Keep stores focused: Design stores to manage a specific, cohesive piece of state to maintain clarity and separation of concerns.
```

## 🧩 Module Prompts

### Important Notes

- You can modify any section or parameter in these prompts to get your desired result. The prompts are starting points that can be customized to fit your specific requirements.
- When using these prompts with AI, consider providing backend response models or examples to help the AI create better TypeScript types.
- Including sample API responses helps ensure type safety and proper integration between frontend and backend.

### Auth Module

````markdown
## Goal

Build a login module for user authentication.

## Layout Requirements

1. The login form should include the following fields:

   - An input for the user's **identifier** (email or username)
   - An input for the **password**
   - A **submit button** to initiate the login process

2. The form container must be **centered both horizontally and vertically** within the page viewport.

## Authentication Details

- The login request should use **JWT-based authentication**.
- **Endpoint:** `POST /api/auth/login`

## Backend Response (For Reference)

Upon successful authentication, the backend returns a response in the following format:

```json
{
  "access_token": "string",
  "user": {
    "email": "string",
    "username": "string",
    "role": "string" // One of: "Admin", "TenantAdmin", "User"
  }
}
```
````

### User Management Module

```markdown
## Goal

Create a **User Management module** in the frontend that allows **authorized Admin users** to manage user accounts.

## Access Control

- This functionality must be available **only to authenticated users** with the `Admin` role.
- All related routes should be **protected** and inaccessible to unauthorized users.

---

## Screens & Features

### View All Users

- **Endpoint:** `GET /api/users`
- Display a list of all users (optionally paginated).
- Show key user details such as name, email, role, and status.

### View User Profile

- **Endpoint:** `GET /api/users/{userId}`
- Show detailed profile information for a selected user.

### Edit User

- **Endpoint:** `PUT /api/users/{userId}` or `PATCH /api/users/{userId}`
- Provide a form to update user details such as name, email, or role.

### Delete User

- **Endpoint:** `DELETE /api/users/{userId}`
- Allow Admin to delete a user with confirmation prompt.

---

## Notes

- These features should only render if the current user has the `Admin` role.
- Frontend routing must ensure these pages/components are not accessible without valid authentication and appropriate role.
- Use the JWT stored from login to authorize API calls.
```

### Tenant Management Module

```markdown
## Goal

Implement a **Tenant Management module** in the frontend that allows authorized users to manage tenants and tenant-specific users.

## Access Control

- All routes and components must be **protected**.
- Only authenticated users with the appropriate role should be allowed access:
  - `Admin`: Full access to manage **all tenants and users**.
  - `TenantAdmin`: Restricted access to **only their own tenant** and associated users.

---

## Tenant Management Features

### Create a New Tenant

- **Endpoint:** `POST /api/tenants`
- **Access:** Admin only
- **Description:** Allow Admin users to create a new tenant via a form.
- **Visibility:** This feature must be hidden from non-Admin users.

### View All Tenants

- **Endpoint:** `GET /api/tenants`
- **Access:**
  - Admin: View **all tenants**
  - TenantAdmin: View **only their own tenant**
- **Description:** Display a list of tenants based on the user's role.

### View Tenant Details

- **Endpoint:** `GET /api/tenants/{tenantId}`
- **Access:**
  - Admin: Can view any tenant
  - TenantAdmin: Can only view **their own** tenant
- **Description:** Display tenant details on a tenant profile/details page.

### Edit Tenant Details

- **Endpoint:** `PUT /api/tenants/{tenantId}` or `PATCH /api/tenants/{tenantId}`
- **Access:**
  - Admin: Can edit any tenant
  - TenantAdmin: Can edit only **their own** tenant
- **Description:** Provide an editable form to update tenant details like name.

### Delete Tenant

- **Endpoint:** `DELETE /api/tenants/{tenantId}`
- **Access:** Admin only
- **Description:** Allow Admin to delete a tenant with confirmation prompt.

---

## Tenant User Management Features

### Add User to Tenant

- **Endpoint:** `POST /api/tenants/{tenantId}/users`
- **Access:**
  - Admin: Can add users to any tenant
  - TenantAdmin: Can add users only to **their own** tenant
- **Description:** Display a form to add a new user under the tenant.

### View Users in a Tenant

- **Endpoint:** `GET /api/tenants/{tenantId}/users`
- **Access:**
  - Admin: View users in any tenant
  - TenantAdmin: View users only in **their own** tenant
- **Description:** List all users belonging to the selected tenant.

### View Specific User Details

- **Endpoint:** `GET /api/tenants/{tenantId}/users/{userId}`
- **Access:**
  - Admin: View any user in any tenant
  - TenantAdmin: View user only if they belong to **their own** tenant
- **Description:** Show detailed user profile view within the tenant context.

### Update Tenant User Details

- **Endpoint:** `PUT` or `PATCH` `/api/tenants/{tenantId}/users/{userId}`
- **Access:**
  - Admin: Can edit any user
  - TenantAdmin: Can edit user only within **their own** tenant
- **Description:** Provide an update form to modify user details (may restrict role editing for TenantAdmin).

### Remove User from Tenant

- **Endpoint:** `DELETE /api/tenants/{tenantId}/users/{userId}`
- **Access:**
  - Admin: Can remove any user from any tenant
  - TenantAdmin: Can remove users only within **their own** tenant
- **Description:** Allow deleting or removing a user from a tenant with confirmation.

---

## Notes

- All views and routes must be guarded by **authentication and role-based authorization** logic.
- Use the JWT (from login) to determine user role and tenant access.
- UI components should dynamically show/hide features based on user role (Admin vs. TenantAdmin).
```
