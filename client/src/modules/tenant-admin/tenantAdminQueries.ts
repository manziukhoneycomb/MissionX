import { clerkInstance } from '../../common/services/clerkInstance';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export const getInvitations = async () => {
  const session = clerkInstance.session;
  
  if (!session) {
    throw new Error('No active session');
  }

  const token = await session.getToken();
  
  const response = await fetch(`${API_BASE_URL}/users/invitations`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch invitations');
  }

  return response.json();
};

export const inviteUser = async (inviteData: {
  email: string;
  firstName?: string;
  lastName?: string;
  roleIds: string[];
}) => {
  const session = clerkInstance.session;
  
  if (!session) {
    throw new Error('No active session');
  }

  const token = await session.getToken();
  
  const response = await fetch(`${API_BASE_URL}/users/invite`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(inviteData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to invite user');
  }

  return response.json();
};

export const resendInvitation = async (invitationId: string) => {
  const session = clerkInstance.session;
  
  if (!session) {
    throw new Error('No active session');
  }

  const token = await session.getToken();
  
  const response = await fetch(`${API_BASE_URL}/users/invitations/${invitationId}/resend`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to resend invitation');
  }

  return response.json();
};

export const cancelInvitation = async (invitationId: string) => {
  const session = clerkInstance.session;
  
  if (!session) {
    throw new Error('No active session');
  }

  const token = await session.getToken();
  
  const response = await fetch(`${API_BASE_URL}/users/invitations/${invitationId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to cancel invitation');
  }
};