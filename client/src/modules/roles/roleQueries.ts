import { clerkInstance } from '../../common/services/clerkInstance';
import { Role } from '../users/types/user';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export const getRoles = async () => {
  const session = clerkInstance.session;
  
  if (!session) {
    throw new Error('No active session');
  }

  const token = await session.getToken();
  
  const response = await fetch(`${API_BASE_URL}/roles`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch roles');
  }

  return response.json();
};
