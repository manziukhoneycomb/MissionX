export const ROLES = {
  ADMIN: 'Admin',
  SUPER_ADMIN: 'Super Admin',
  USER: 'User',
} as const;

export type RoleValue = (typeof ROLES)[keyof typeof ROLES];
