# Teams Module

This module provides comprehensive team management functionality for the application.

## Features

### Team Management
- Create, edit, and delete teams
- Activate/deactivate teams
- View team list with pagination and sorting

### Member Management
- Add team members with specific roles (OWNER, ADMIN, MEMBER)
- Update member roles
- Remove members from teams
- View all team members

### Team Context
- Global team selection context for cross-component state sharing
- Team selector component for easy team switching
- Integration with existing authentication and authorization

## Components

- `TeamManagementPage`: Main page with team list and management features
- `TeamList`: Table view of teams with actions
- `TeamForm`: Create/edit team form
- `TeamMembers`: Member management dialog
- `AddMemberDialog`: Add new members to teams
- `TeamSelector`: Dropdown for team selection

## Architecture

The module follows the established application patterns:
- React Query for server state management
- Zustand for local UI state
- Material-UI for consistent styling
- Formik for form handling
- TypeScript for type safety

## Usage

```tsx
import { TeamManagementPage } from '../modules/teams';

// In routing
<Route path="/team-management" element={<TeamManagementPage />} />
```

## Permissions

Teams are accessible to users with Admin or Super Admin roles, following the hybrid approach with both global and team-specific roles.