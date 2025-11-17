// Mock billing service with placeholder data for future integration

export interface BillingPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  billingCycle: 'monthly' | 'annual';
  features: string[];
  isPopular?: boolean;
}

export interface BillingInfo {
  id: string;
  tenantId: string;
  currentPlan: BillingPlan;
  billingEmail: string;
  paymentMethod: {
    type: 'credit_card' | 'bank_account';
    last4: string;
    brand?: string;
    expiryMonth?: number;
    expiryYear?: number;
  };
  billingAddress: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  nextBillingDate: string;
  billingHistory: BillingHistoryItem[];
}

export interface BillingHistoryItem {
  id: string;
  date: string;
  amount: number;
  status: 'paid' | 'pending' | 'failed';
  description: string;
  invoiceUrl?: string;
}

// Mock data - replace with real API calls
const mockPlans: BillingPlan[] = [
  {
    id: 'basic',
    name: 'Basic',
    description: 'Perfect for small teams getting started',
    price: 29,
    billingCycle: 'monthly',
    features: [
      'Up to 5 users',
      'Basic analytics',
      'Email support',
      '5GB storage',
      'Standard integrations',
    ],
  },
  {
    id: 'professional',
    name: 'Professional',
    description: 'Advanced features for growing businesses',
    price: 99,
    billingCycle: 'monthly',
    features: [
      'Up to 25 users',
      'Advanced analytics',
      'Priority support',
      '50GB storage',
      'All integrations',
      'Custom reports',
      'API access',
    ],
    isPopular: true,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    description: 'Unlimited power for large organizations',
    price: 299,
    billingCycle: 'monthly',
    features: [
      'Unlimited users',
      'Enterprise analytics',
      'Dedicated support',
      'Unlimited storage',
      'Custom integrations',
      'White-label options',
      'SLA guarantee',
      'Advanced security',
    ],
  },
];

const mockBillingInfo: BillingInfo = {
  id: 'billing-001',
  tenantId: 'tenant-001',
  currentPlan: mockPlans[1], // Professional plan
  billingEmail: 'billing@company.com',
  paymentMethod: {
    type: 'credit_card',
    last4: '4242',
    brand: 'Visa',
    expiryMonth: 12,
    expiryYear: 2025,
  },
  billingAddress: {
    line1: '123 Business St',
    line2: 'Suite 100',
    city: 'San Francisco',
    state: 'CA',
    postalCode: '94105',
    country: 'US',
  },
  nextBillingDate: '2024-01-15T00:00:00Z',
  billingHistory: [
    {
      id: 'inv-001',
      date: '2023-12-15T00:00:00Z',
      amount: 99,
      status: 'paid',
      description: 'Professional Plan - Monthly',
      invoiceUrl: '#',
    },
    {
      id: 'inv-002',
      date: '2023-11-15T00:00:00Z',
      amount: 99,
      status: 'paid',
      description: 'Professional Plan - Monthly',
      invoiceUrl: '#',
    },
    {
      id: 'inv-003',
      date: '2023-10-15T00:00:00Z',
      amount: 29,
      status: 'paid',
      description: 'Basic Plan - Monthly',
      invoiceUrl: '#',
    },
  ],
};

// Mock API functions - replace with real API integration
export const getBillingInfo = async (): Promise<{ data: BillingInfo }> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  return { data: mockBillingInfo };
};

export const getAvailablePlans = async (): Promise<{ data: BillingPlan[] }> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300));
  return { data: mockPlans };
};

export const updatePaymentMethod = async (data: Partial<BillingInfo['paymentMethod']>): Promise<{ data: BillingInfo }> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Mock update
  const updatedBillingInfo = {
    ...mockBillingInfo,
    paymentMethod: { ...mockBillingInfo.paymentMethod, ...data },
  };
  
  return { data: updatedBillingInfo };
};

export const changePlan = async (planId: string): Promise<{ data: BillingInfo }> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  const newPlan = mockPlans.find(plan => plan.id === planId);
  if (!newPlan) {
    throw new Error('Plan not found');
  }
  
  const updatedBillingInfo = {
    ...mockBillingInfo,
    currentPlan: newPlan,
  };
  
  return { data: updatedBillingInfo };
};

export const updateBillingAddress = async (address: BillingInfo['billingAddress']): Promise<{ data: BillingInfo }> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  const updatedBillingInfo = {
    ...mockBillingInfo,
    billingAddress: address,
  };
  
  return { data: updatedBillingInfo };
};