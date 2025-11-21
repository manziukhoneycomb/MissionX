import { useMutation } from '@tanstack/react-query';
import axios from 'axios';

interface InviteUserRequest {
  email: string;
  firstName: string;
  lastName: string;
  roleNames: string[];
}

interface AssignRolesRequest {
  userId: string;
  roleNames: string[];
}

interface ToggleUserStatusRequest {
  userId: string;
  activate: boolean;
}

const inviteUserToTenant = (data: InviteUserRequest) =>
  axios.post('/tenant/users/invite', data);

const removeUserFromTenant = (userId: string) =>
  axios.delete(`/tenant/users/${userId}`);

const assignUserRoles = (data: AssignRolesRequest) =>
  axios.post(`/tenant/users/${data.userId}/roles`, {
    roleNames: data.roleNames,
  });

const toggleUserStatusAPI = (data: ToggleUserStatusRequest) =>
  axios.patch(`/tenant/users/${data.userId}/status`, {
    isActive: data.activate,
  });

export const useUserInvitation = () => {
  const inviteUser = useMutation({
    mutationFn: inviteUserToTenant,
  });

  const removeUser = useMutation({
    mutationFn: removeUserFromTenant,
  });

  const assignRoles = useMutation({
    mutationFn: assignUserRoles,
  });

  const toggleUserStatus = useMutation({
    mutationFn: toggleUserStatusAPI,
  });

  return {
    inviteUser,
    removeUser,
    assignRoles,
    toggleUserStatus,
  };
};