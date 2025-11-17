import { clerkInstance } from '../../common/services/clerkInstance';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

export const deleteUser = async (userId: string): Promise<void> => {
  const token = await clerkInstance.session?.getToken();
  
  const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
    throw new Error(errorData.message || 'Failed to delete user');
  }
};

export const activateUser = async (userId: string): Promise<void> => {
  const token = await clerkInstance.session?.getToken();
  
  const response = await fetch(`${API_BASE_URL}/users/${userId}/activate`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
    throw new Error(errorData.message || 'Failed to activate user');
  }
};

export const deactivateUser = async (userId: string): Promise<void> => {
  const token = await clerkInstance.session?.getToken();
  
  const response = await fetch(`${API_BASE_URL}/users/${userId}/deactivate`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
    throw new Error(errorData.message || 'Failed to deactivate user');
  }
};

export const inviteUser = async (inviteData: { 
  email: string; 
  roleIds: string[] 
}): Promise<void> => {
  const token = await clerkInstance.session?.getToken();
  
  const response = await fetch(`${API_BASE_URL}/users/invite`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(inviteData),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
    throw new Error(errorData.message || 'Failed to send invitation');
  }
};