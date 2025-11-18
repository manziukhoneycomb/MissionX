export interface BillingInfo {
  currentPlan: {
    id: string;
    name: string;
    price: number;
    interval: 'monthly' | 'yearly';
    features: string[];
  };
  usage: {
    users: {
      current: number;
      limit: number;
    };
    storage: {
      current: number;
      limit: number;
      unit: 'GB';
    };
    apiCalls: {
      current: number;
      limit: number;
    };
  };
  nextBillingDate: string;
  paymentMethod: {
    type: 'card' | 'bank';
    last4: string;
    brand?: string;
    expiryMonth?: number;
    expiryYear?: number;
  };
  billingHistory: {
    id: string;
    date: string;
    amount: number;
    status: 'paid' | 'pending' | 'failed';
    description: string;
  }[];
}

export interface AvailablePlan {
  id: string;
  name: string;
  price: number;
  interval: 'monthly' | 'yearly';
  features: string[];
  popular?: boolean;
}

const mockBillingData: BillingInfo = {
  currentPlan: {
    id: 'pro-monthly',
    name: 'Pro Plan',
    price: 49.99,
    interval: 'monthly',
    features: [
      'Up to 25 users',
      '500 GB storage',
      '10,000 API calls/month',
      'Advanced analytics',
      'Priority support'
    ]
  },
  usage: {
    users: {
      current: 12,
      limit: 25
    },
    storage: {
      current: 156,
      limit: 500,
      unit: 'GB'
    },
    apiCalls: {
      current: 3450,
      limit: 10000
    }
  },
  nextBillingDate: '2025-01-15',
  paymentMethod: {
    type: 'card',
    last4: '4242',
    brand: 'Visa',
    expiryMonth: 12,
    expiryYear: 2026
  },
  billingHistory: [
    {
      id: 'inv-001',
      date: '2024-12-15',
      amount: 49.99,
      status: 'paid',
      description: 'Pro Plan - Monthly subscription'
    },
    {
      id: 'inv-002',
      date: '2024-11-15',
      amount: 49.99,
      status: 'paid',
      description: 'Pro Plan - Monthly subscription'
    },
    {
      id: 'inv-003',
      date: '2024-10-15',
      amount: 49.99,
      status: 'paid',
      description: 'Pro Plan - Monthly subscription'
    }
  ]
};

const availablePlans: AvailablePlan[] = [
  {
    id: 'starter-monthly',
    name: 'Starter',
    price: 19.99,
    interval: 'monthly',
    features: [
      'Up to 10 users',
      '100 GB storage',
      '2,500 API calls/month',
      'Basic analytics',
      'Email support'
    ]
  },
  {
    id: 'pro-monthly',
    name: 'Pro',
    price: 49.99,
    interval: 'monthly',
    popular: true,
    features: [
      'Up to 25 users',
      '500 GB storage',
      '10,000 API calls/month',
      'Advanced analytics',
      'Priority support'
    ]
  },
  {
    id: 'enterprise-monthly',
    name: 'Enterprise',
    price: 99.99,
    interval: 'monthly',
    features: [
      'Unlimited users',
      '2 TB storage',
      'Unlimited API calls',
      'Custom analytics',
      'Dedicated support',
      'SLA guarantee'
    ]
  }
];

export const mockBillingService = {
  getBillingInfo: async (): Promise<BillingInfo> => {
    return new Promise((resolve) => {
      setTimeout(() => resolve(mockBillingData), 500);
    });
  },

  getAvailablePlans: async (): Promise<AvailablePlan[]> => {
    return new Promise((resolve) => {
      setTimeout(() => resolve(availablePlans), 300);
    });
  },

  updatePaymentMethod: async (paymentMethod: Partial<BillingInfo['paymentMethod']>): Promise<void> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        mockBillingData.paymentMethod = { ...mockBillingData.paymentMethod, ...paymentMethod };
        resolve();
      }, 1000);
    });
  },

  changePlan: async (planId: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const plan = availablePlans.find(p => p.id === planId);
        if (plan) {
          mockBillingData.currentPlan = plan;
          resolve();
        } else {
          reject(new Error('Plan not found'));
        }
      }, 1000);
    });
  }
};