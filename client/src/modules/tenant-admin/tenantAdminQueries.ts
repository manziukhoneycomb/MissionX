import axios from 'axios';
import { User } from '../users/types/user';

export interface InviteUserRequest {
  email: string;
  roleIds: string[];
  redirectUrl?: string;
}

export interface InviteResponse {
  id: string;
  emailAddress: string;
  status: string;
  publicMetadata: Record<string, any>;
  createdAt: number;
  updatedAt: number;
}

export interface AssignRoleRequest {
  roleIds: string[];
}

export const getTenantUsers = (tenantId: string) => 
  axios.get<User[]>(`/users/tenants/${tenantId}/users`);

export const getTenantInvitations = (tenantId: string) =>
  axios.get<InviteResponse[]>(`/users/tenants/${tenantId}/invitations`);

export const inviteTenantUser = (tenantId: string, inviteData: InviteUserRequest) =>
  axios.post<InviteResponse>(`/users/tenants/${tenantId}/invite`, inviteData);

export const removeTenantUser = (tenantId: string, userId: string) =>
  axios.delete(`/users/tenants/${tenantId}/users/${userId}`);

export const assignTenantUserRole = (tenantId: string, userId: string, roleData: AssignRoleRequest) =>
  axios.patch<User>(`/users/tenants/${tenantId}/users/${userId}/role`, roleData);

export const revokeTenantInvitation = (tenantId: string, invitationId: string) =>
  axios.delete(`/users/tenants/${tenantId}/invitations/${invitationId}`);