import { useQuery } from '@tanstack/react-query';
import { analyticsKeys } from './analyticsQueryKeys';
import { analyticsService, AnalyticsFilters } from './services/analyticsService';
import { CACHE_TIMES } from '../../common/constants/cacheTimes';

export const useRevenueData = (filters?: AnalyticsFilters) => {
  return useQuery({
    queryKey: analyticsKeys.revenue(filters),
    queryFn: () => analyticsService.getRevenueData(filters),
    staleTime: CACHE_TIMES.MEDIUM,
  });
};

export const useTenantMetrics = (filters?: AnalyticsFilters) => {
  return useQuery({
    queryKey: analyticsKeys.tenants(filters),
    queryFn: () => analyticsService.getTenantMetrics(filters),
    staleTime: CACHE_TIMES.MEDIUM,
  });
};

export const useInvoiceStatusData = (filters?: AnalyticsFilters) => {
  return useQuery({
    queryKey: analyticsKeys.invoiceStatus(filters),
    queryFn: () => analyticsService.getInvoiceStatusData(filters),
    staleTime: CACHE_TIMES.MEDIUM,
  });
};

export const usePaymentDistribution = (filters?: AnalyticsFilters) => {
  return useQuery({
    queryKey: analyticsKeys.paymentDistribution(filters),
    queryFn: () => analyticsService.getPaymentDistribution(filters),
    staleTime: CACHE_TIMES.MEDIUM,
  });
};