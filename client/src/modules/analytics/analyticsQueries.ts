import { useQuery } from '@tanstack/react-query';
import { analyticsKeys } from './analyticsQueryKeys';
import { analyticsService } from './services/analyticsService';
import { AnalyticsFilters } from './types/analytics';
import { CACHE_TIMES } from '../../common/constants/cacheTimes';

export const useAnalyticsData = (filters?: AnalyticsFilters) => {
  return useQuery({
    queryKey: analyticsKeys.data(filters),
    queryFn: () => analyticsService.getAnalyticsData(filters),
    staleTime: CACHE_TIMES.MEDIUM,
    gcTime: CACHE_TIMES.MEDIUM,
  });
};

export const useRevenueMetrics = (filters?: AnalyticsFilters) => {
  return useQuery({
    queryKey: analyticsKeys.revenue(filters),
    queryFn: () => analyticsService.getRevenueMetrics(filters),
    staleTime: CACHE_TIMES.MEDIUM,
    gcTime: CACHE_TIMES.MEDIUM,
  });
};

export const useTenantMetrics = (filters?: AnalyticsFilters) => {
  return useQuery({
    queryKey: analyticsKeys.tenants(filters),
    queryFn: () => analyticsService.getTenantMetrics(filters),
    staleTime: CACHE_TIMES.MEDIUM,
    gcTime: CACHE_TIMES.MEDIUM,
  });
};

export const useInvoiceStatusMetrics = (filters?: AnalyticsFilters) => {
  return useQuery({
    queryKey: analyticsKeys.invoiceStatus(filters),
    queryFn: () => analyticsService.getInvoiceStatusMetrics(filters),
    staleTime: CACHE_TIMES.MEDIUM,
    gcTime: CACHE_TIMES.MEDIUM,
  });
};

export const usePaymentDistribution = (filters?: AnalyticsFilters) => {
  return useQuery({
    queryKey: analyticsKeys.paymentDistribution(filters),
    queryFn: () => analyticsService.getPaymentDistribution(filters),
    staleTime: CACHE_TIMES.MEDIUM,
    gcTime: CACHE_TIMES.MEDIUM,
  });
};