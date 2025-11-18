import axios from 'axios';
import { User } from '../../users/types/user';

export const getTenantUsers = (tenantId: string) =>
  axios.get<User[]>(`/users/tenants/${tenantId}`);

export const getTenantBilling = (tenantId: string) =>
  axios.get(`/tenants/${tenantId}/billing`);