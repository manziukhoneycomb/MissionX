export type PaymentMethod = {
  id: string;
  type: 'card' | 'bank_account';
  last4: string;
  brand?: string;
  expiryMonth?: number;
  expiryYear?: number;
  isDefault: boolean;
  holderName?: string;
};

export type Subscription = {
  id: string;
  status: 'active' | 'inactive' | 'past_due' | 'canceled' | 'unpaid';
  planName: string;
  planPrice: number;
  planInterval: 'month' | 'year';
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  trialEnd?: string;
};

export type BillingInfo = {
  subscription: Subscription;
  paymentMethods: PaymentMethod[];
  upcomingInvoice?: {
    id: string;
    amount: number;
    dueDate: string;
    status: 'draft' | 'open' | 'paid' | 'void';
  };
  billingHistory: Array<{
    id: string;
    amount: number;
    status: 'paid' | 'pending' | 'failed';
    date: string;
    description: string;
    downloadUrl?: string;
  }>;
};

export type AddPaymentMethodRequest = {
  type: 'card' | 'bank_account';
  token: string;
  setAsDefault?: boolean;
};

export type UpdateSubscriptionRequest = {
  planId: string;
};