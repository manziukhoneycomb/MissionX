import axios from 'axios';
import { User } from '../../users/types/user';

export interface InviteUserInput {
  email: string;
  firstName?: string;
  lastName?: string;
  roleIds: string[];
}

export interface UpdateTenantUserInput {
  email?: string;
  firstName?: string;
  lastName?: string;
  roleIds?: string[];
}

export const inviteUserToTenant = (tenantId: string, userData: InviteUserInput) =>
  axios.post<User>(`/users/tenants/${tenantId}/invite`, userData);

export const updateTenantUser = (tenantId: string, userId: string, userData: UpdateTenantUserInput) =>
  axios.patch<User>(`/users/tenants/${tenantId}/users/${userId}`, userData);

export const removeUserFromTenant = (tenantId: string, userId: string) =>
  axios.delete(`/users/tenants/${tenantId}/users/${userId}`);