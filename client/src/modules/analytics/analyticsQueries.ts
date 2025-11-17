import { useQuery } from '@tanstack/react-query';
import { analyticsService } from './services/analyticsService';
import { analyticsQueryKeys } from './analyticsQueryKeys';

export const useAnalyticsData = (startDate?: string, endDate?: string) => {
  return useQuery({
    queryKey: analyticsQueryKeys.data(startDate, endDate),
    queryFn: () => analyticsService.getAnalyticsData(startDate, endDate),
    staleTime: 5 * 60 * 1000,
    retry: 3,
  });
};

export const useRevenueData = (
  period: 'monthly' | 'quarterly' = 'monthly',
  startDate?: string,
  endDate?: string,
) => {
  return useQuery({
    queryKey: analyticsQueryKeys.revenue(period, startDate, endDate),
    queryFn: () => analyticsService.getRevenueData(period, startDate, endDate),
    staleTime: 5 * 60 * 1000,
    retry: 3,
  });
};

export const useTenantMetrics = (
  sortBy: 'invoiceCount' | 'revenue' | 'timeliness' = 'revenue',
  order: 'asc' | 'desc' = 'desc',
) => {
  return useQuery({
    queryKey: analyticsQueryKeys.tenants(sortBy, order),
    queryFn: () => analyticsService.getTenantMetrics(sortBy, order),
    staleTime: 5 * 60 * 1000,
    retry: 3,
  });
};

export const useInvoiceStatusData = () => {
  return useQuery({
    queryKey: analyticsQueryKeys.invoiceStatus(),
    queryFn: () => analyticsService.getInvoiceStatusData(),
    staleTime: 5 * 60 * 1000,
    retry: 3,
  });
};

export const usePaymentDistribution = (period?: string) => {
  return useQuery({
    queryKey: analyticsQueryKeys.paymentDistribution(period),
    queryFn: () => analyticsService.getPaymentDistribution(period),
    staleTime: 5 * 60 * 1000,
    retry: 3,
  });
};