import { clerkInstance } from '../../common/services/clerkInstance';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export const getBillingInfo = async () => {
  const session = clerkInstance.session;
  
  if (!session) {
    throw new Error('No active session');
  }

  const token = await session.getToken();
  
  const response = await fetch(`${API_BASE_URL}/billing`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to fetch billing information' }));
    throw new Error(error.message || 'Failed to fetch billing information');
  }

  return response.json();
};

export const addPaymentMethod = async (paymentData: {
  type: 'card' | 'bank_account';
  token: string;
  setAsDefault?: boolean;
}) => {
  const session = clerkInstance.session;
  
  if (!session) {
    throw new Error('No active session');
  }

  const token = await session.getToken();
  
  const response = await fetch(`${API_BASE_URL}/billing/payment-methods`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(paymentData),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to add payment method' }));
    throw new Error(error.message || 'Failed to add payment method');
  }

  return response.json();
};

export const removePaymentMethod = async (paymentMethodId: string) => {
  const session = clerkInstance.session;
  
  if (!session) {
    throw new Error('No active session');
  }

  const token = await session.getToken();
  
  const response = await fetch(`${API_BASE_URL}/billing/payment-methods/${paymentMethodId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to remove payment method' }));
    throw new Error(error.message || 'Failed to remove payment method');
  }
};

export const setDefaultPaymentMethod = async (paymentMethodId: string) => {
  const session = clerkInstance.session;
  
  if (!session) {
    throw new Error('No active session');
  }

  const token = await session.getToken();
  
  const response = await fetch(`${API_BASE_URL}/billing/payment-methods/${paymentMethodId}/default`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to set default payment method' }));
    throw new Error(error.message || 'Failed to set default payment method');
  }

  return response.json();
};

export const updateSubscription = async (planId: string) => {
  const session = clerkInstance.session;
  
  if (!session) {
    throw new Error('No active session');
  }

  const token = await session.getToken();
  
  const response = await fetch(`${API_BASE_URL}/billing/subscription`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ planId }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to update subscription' }));
    throw new Error(error.message || 'Failed to update subscription');
  }

  return response.json();
};