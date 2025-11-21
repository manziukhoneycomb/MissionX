import { useQuery, useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { CACHE_TIMES } from '../common/constants/cacheTimes';

interface PaymentMethod {
  id: string;
  type: string;
  brand: string;
  last4: string;
  expMonth: number;
  expYear: number;
  isDefault: boolean;
  billingAddress?: {
    line1?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  };
}

interface PaymentMethodData {
  type: 'card';
  card: {
    number: string;
    exp_month: number;
    exp_year: number;
    cvc: string;
  };
  billing_details: {
    name: string;
    address: {
      line1: string;
      city: string;
      state: string;
      postalCode: string;
      country: string;
    };
  };
}

const PAYMENT_METHODS_QUERY_KEY = 'paymentMethods';

export const getPaymentMethods = () =>
  axios.get<PaymentMethod[]>('/tenant/billing/payment-methods');

export const addPaymentMethodToTenant = (data: PaymentMethodData) =>
  axios.post('/tenant/billing/payment-methods', data);

export const deletePaymentMethodFromTenant = (paymentMethodId: string) =>
  axios.delete(`/tenant/billing/payment-methods/${paymentMethodId}`);

export const setDefaultPaymentMethodForTenant = (paymentMethodId: string) =>
  axios.patch(`/tenant/billing/payment-methods/${paymentMethodId}/default`);

export const usePaymentMethods = () => {
  const query = useQuery({
    queryKey: [PAYMENT_METHODS_QUERY_KEY],
    queryFn: getPaymentMethods,
    staleTime: CACHE_TIMES.DEFAULT,
    refetchOnWindowFocus: false,
  });

  const addPaymentMethod = useMutation({
    mutationFn: addPaymentMethodToTenant,
  });

  const deletePaymentMethod = useMutation({
    mutationFn: deletePaymentMethodFromTenant,
  });

  const setDefaultPaymentMethod = useMutation({
    mutationFn: setDefaultPaymentMethodForTenant,
  });

  return {
    ...query,
    addPaymentMethod,
    deletePaymentMethod,
    setDefaultPaymentMethod,
  };
};