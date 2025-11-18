export interface BillingPlan {
  id: string;
  name: string;
  price: number;
  currency: string;
  interval: 'monthly' | 'yearly';
  features: string[];
  recommended?: boolean;
}

export interface PaymentMethod {
  id: string;
  type: 'card' | 'bank_account';
  last4: string;
  brand?: string;
  expiryMonth?: number;
  expiryYear?: number;
  isDefault: boolean;
}

export interface BillingInfo {
  currentPlan: BillingPlan;
  nextBillingDate: string;
  billingAddress: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  paymentMethods: PaymentMethod[];
  usageMetrics: {
    usersCount: number;
    usersLimit: number;
    invoicesProcessed: number;
    invoicesLimit: number;
    storageUsedGB: number;
    storageLimit: number;
  };
  billingHistory: {
    id: string;
    date: string;
    amount: number;
    status: 'paid' | 'pending' | 'failed';
    description: string;
  }[];
}

const MOCK_PLANS: BillingPlan[] = [
  {
    id: 'starter',
    name: 'Starter',
    price: 29,
    currency: 'USD',
    interval: 'monthly',
    features: [
      'Up to 10 users',
      '1,000 invoices/month',
      '10GB storage',
      'Basic support',
      'Standard reports',
    ],
  },
  {
    id: 'professional',
    name: 'Professional',
    price: 79,
    currency: 'USD',
    interval: 'monthly',
    features: [
      'Up to 50 users',
      '10,000 invoices/month',
      '100GB storage',
      'Priority support',
      'Advanced reports',
      'API access',
    ],
    recommended: true,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 199,
    currency: 'USD',
    interval: 'monthly',
    features: [
      'Unlimited users',
      'Unlimited invoices',
      '1TB storage',
      '24/7 phone support',
      'Custom reports',
      'Full API access',
      'SLA guarantee',
    ],
  },
];

const MOCK_BILLING_INFO: BillingInfo = {
  currentPlan: MOCK_PLANS[1], // Professional plan
  nextBillingDate: '2024-01-15',
  billingAddress: {
    line1: '123 Business Street',
    line2: 'Suite 100',
    city: 'San Francisco',
    state: 'CA',
    postalCode: '94105',
    country: 'US',
  },
  paymentMethods: [
    {
      id: 'pm_1234',
      type: 'card',
      last4: '4242',
      brand: 'Visa',
      expiryMonth: 12,
      expiryYear: 2025,
      isDefault: true,
    },
    {
      id: 'pm_5678',
      type: 'card',
      last4: '5555',
      brand: 'Mastercard',
      expiryMonth: 8,
      expiryYear: 2026,
      isDefault: false,
    },
  ],
  usageMetrics: {
    usersCount: 23,
    usersLimit: 50,
    invoicesProcessed: 1247,
    invoicesLimit: 10000,
    storageUsedGB: 12.5,
    storageLimit: 100,
  },
  billingHistory: [
    {
      id: 'inv_001',
      date: '2023-12-15',
      amount: 79,
      status: 'paid',
      description: 'Professional Plan - December 2023',
    },
    {
      id: 'inv_002',
      date: '2023-11-15',
      amount: 79,
      status: 'paid',
      description: 'Professional Plan - November 2023',
    },
    {
      id: 'inv_003',
      date: '2023-10-15',
      amount: 29,
      status: 'paid',
      description: 'Starter Plan - October 2023',
    },
  ],
};

export const mockBillingService = {
  getBillingInfo: async (): Promise<BillingInfo> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    return MOCK_BILLING_INFO;
  },

  getAvailablePlans: async (): Promise<BillingPlan[]> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    return MOCK_PLANS;
  },

  changePlan: async (planId: string): Promise<void> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const newPlan = MOCK_PLANS.find(plan => plan.id === planId);
    if (!newPlan) {
      throw new Error('Plan not found');
    }
    
    // In a real implementation, this would update the backend
    MOCK_BILLING_INFO.currentPlan = newPlan;
  },

  addPaymentMethod: async (paymentMethod: Omit<PaymentMethod, 'id'>): Promise<PaymentMethod> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const newPaymentMethod: PaymentMethod = {
      ...paymentMethod,
      id: `pm_${Date.now()}`,
    };
    
    MOCK_BILLING_INFO.paymentMethods.push(newPaymentMethod);
    return newPaymentMethod;
  },

  setDefaultPaymentMethod: async (paymentMethodId: string): Promise<void> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    MOCK_BILLING_INFO.paymentMethods.forEach(pm => {
      pm.isDefault = pm.id === paymentMethodId;
    });
  },

  deletePaymentMethod: async (paymentMethodId: string): Promise<void> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const index = MOCK_BILLING_INFO.paymentMethods.findIndex(pm => pm.id === paymentMethodId);
    if (index === -1) {
      throw new Error('Payment method not found');
    }
    
    MOCK_BILLING_INFO.paymentMethods.splice(index, 1);
  },
};