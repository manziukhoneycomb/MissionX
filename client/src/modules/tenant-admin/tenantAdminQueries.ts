import axios from 'axios';
import { User } from '../users/types/user';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

interface ApiResponse<T> {
  data: T;
}

export const getTenantUsers = async (): Promise<ApiResponse<User[]>> => {
  const response = await axios.get(`${API_BASE_URL}/users`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('__clerk_token')}`,
    },
  });
  return response.data;
};

export const getTenantBillingInfo = async (): Promise<ApiResponse<any>> => {
  // Mock billing data - will be replaced with actual API call
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        data: {
          currentPlan: 'Professional',
          status: 'active',
          nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          monthlySpend: 29.99,
          usageThisMonth: {
            users: 8,
            storage: 15.2,
            apiCalls: 45000,
          },
          limits: {
            users: 50,
            storage: 100,
            apiCalls: 100000,
          },
          paymentMethod: {
            type: 'card',
            brand: 'Visa',
            last4: '4242',
            expiryMonth: 12,
            expiryYear: 2025,
          },
        },
      });
    }, 500);
  });
};

export const getTenantInvoices = async (): Promise<ApiResponse<any[]>> => {
  // Mock invoice data - will be replaced with actual API call
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        data: [
          {
            id: 'INV-2024-001',
            date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
            amount: 29.99,
            status: 'paid',
            downloadUrl: '#',
          },
          {
            id: 'INV-2024-002',
            date: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
            amount: 29.99,
            status: 'paid',
            downloadUrl: '#',
          },
          {
            id: 'INV-2024-003',
            date: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
            amount: 29.99,
            status: 'paid',
            downloadUrl: '#',
          },
        ],
      });
    }, 300);
  });
};