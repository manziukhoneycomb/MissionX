import { useQuery } from '@tanstack/react-query';
import { analyticsService } from './services/analyticsService';
import { AnalyticsDateRange } from './types/analytics';
import { CACHE_TIMES } from '../../common/constants/cacheTimes';

export const analyticsQueryKeys = {
  all: ['analytics'] as const,
  revenue: (dateRange?: AnalyticsDateRange) => [...analyticsQueryKeys.all, 'revenue', dateRange] as const,
  tenants: (dateRange?: AnalyticsDateRange) => [...analyticsQueryKeys.all, 'tenants', dateRange] as const,
  invoiceStatus: (dateRange?: AnalyticsDateRange) => [...analyticsQueryKeys.all, 'invoice-status', dateRange] as const,
  paymentDistribution: (dateRange?: AnalyticsDateRange) => [...analyticsQueryKeys.all, 'payment-distribution', dateRange] as const,
};

export const useRevenueAnalytics = (dateRange?: AnalyticsDateRange) => {
  return useQuery({
    queryKey: analyticsQueryKeys.revenue(dateRange),
    queryFn: () => analyticsService.getRevenueAnalytics(dateRange),
    staleTime: CACHE_TIMES.ANALYTICS,
    retry: 2,
  });
};

export const useTenantAnalytics = (dateRange?: AnalyticsDateRange) => {
  return useQuery({
    queryKey: analyticsQueryKeys.tenants(dateRange),
    queryFn: () => analyticsService.getTenantAnalytics(dateRange),
    staleTime: CACHE_TIMES.ANALYTICS,
    retry: 2,
  });
};

export const useInvoiceStatusAnalytics = (dateRange?: AnalyticsDateRange) => {
  return useQuery({
    queryKey: analyticsQueryKeys.invoiceStatus(dateRange),
    queryFn: () => analyticsService.getInvoiceStatusAnalytics(dateRange),
    staleTime: CACHE_TIMES.ANALYTICS,
    retry: 2,
  });
};

export const usePaymentDistributionAnalytics = (dateRange?: AnalyticsDateRange) => {
  return useQuery({
    queryKey: analyticsQueryKeys.paymentDistribution(dateRange),
    queryFn: () => analyticsService.getPaymentDistributionAnalytics(dateRange),
    staleTime: CACHE_TIMES.ANALYTICS,
    retry: 2,
  });
};