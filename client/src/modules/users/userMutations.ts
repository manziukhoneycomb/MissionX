import axios from 'axios';
import { User } from './types/user';

export type CreateUserInput = {
  email: string;
  roleIds: string[];
  subId?: string;
  firstName?: string;
  lastName?: string;
};

export type CreateUserSuperAdminInput = CreateUserInput & {
  tenantId?: string;
};

export type UpdateUserInput = {
  email?: string;
  roleIds?: string[];
  subId?: string;
  firstName?: string;
  lastName?: string;
};

export type UpdateUserPayload = {
  id: string;
  data: UpdateUserInput;
};

export const createUser = (userData: CreateUserInput) => axios.post<User>('/users', userData);

export const createUserBySuperAdmin = (userData: CreateUserSuperAdminInput) =>
  axios.post<User>('/users/super', userData);

export const updateUser = (userPayload: UpdateUserPayload) =>
  axios.patch<User>(`/users/${userPayload.id}`, userPayload.data);

export const deleteUser = (id: string) => axios.delete(`/users/${id}`);

export const activateUser = (id: string) => axios.patch(`/users/${id}/activate`);

export const deactivateUser = (id: string) => axios.patch(`/users/${id}/deactivate`);
