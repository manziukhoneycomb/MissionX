import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

export interface InviteUserInput {
  email: string;
  firstName?: string;
  lastName?: string;
  roleIds: string[];
  sendWelcomeEmail: boolean;
}

export const inviteUserToTenant = async (data: InviteUserInput): Promise<void> => {
  const response = await axios.post(`${API_BASE_URL}/tenant-admin/invite-user`, data, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('__clerk_token')}`,
    },
  });
  return response.data;
};