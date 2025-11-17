import { clerkInstance } from '../../common/services/clerkInstance';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

interface ApiResponse<T> {
  data: T;
}

export const getTenantUsers = async (): Promise<ApiResponse<any[]>> => {
  const token = await clerkInstance.session?.getToken();
  
  const response = await fetch(`${API_BASE_URL}/users`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
    throw new Error(errorData.message || 'Failed to fetch tenant users');
  }

  const data = await response.json();
  return { data };
};

export const getTenantBilling = async (): Promise<any> => {
  // Mock implementation - replace with real API call later
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        subscription: {
          plan: 'Professional',
          status: 'active',
          nextBillingDate: '2024-12-01',
          amount: 99.99,
          currency: 'USD',
        },
        paymentMethod: {
          type: 'credit_card',
          last4: '4242',
          brand: 'Visa',
          expiryDate: '12/26',
        },
        invoices: [
          {
            id: 'inv_001',
            date: '2024-11-01',
            amount: 99.99,
            status: 'paid',
            downloadUrl: '#',
          },
        ],
        usage: {
          currentUsers: 12,
          maxUsers: 25,
          storageUsed: 2.4,
          maxStorage: 10,
          apiCallsThisMonth: 8500,
          apiCallsLimit: 15000,
        },
      });
    }, 500);
  });
};