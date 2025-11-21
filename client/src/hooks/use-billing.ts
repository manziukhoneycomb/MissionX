import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { CACHE_TIMES } from '../common/constants/cacheTimes';

interface Subscription {
  id: string;
  status: 'active' | 'canceled' | 'past_due' | 'incomplete' | 'trialing';
  planName: string;
  amount: number;
  currency: string;
  interval: 'month' | 'year';
  currentPeriodStart: string;
  currentPeriodEnd: string;
  nextBillingDate: string;
  cancelAtPeriodEnd: boolean;
}

interface BillingData {
  subscription?: Subscription;
  usage?: {
    currentPeriod: {
      users: number;
      apiCalls: number;
      storage: number;
    };
    limits: {
      users: number;
      apiCalls: number;
      storage: number;
    };
  };
}

const BILLING_QUERY_KEY = 'billing';

export const getBillingInfo = () => axios.get<BillingData>('/tenant/billing');

export const useBilling = () => {
  return useQuery({
    queryKey: [BILLING_QUERY_KEY],
    queryFn: getBillingInfo,
    staleTime: CACHE_TIMES.DEFAULT,
    refetchOnWindowFocus: false,
  });
};