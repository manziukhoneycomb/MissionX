import { useQuery } from '@tanstack/react-query';
import { analyticsKeys } from './analyticsQueryKeys';
import { analyticsService } from './services/analyticsService';
import { AnalyticsFilters } from './types/analytics';
import { CACHE_TIMES } from '../../common/constants/cacheTimes';

/**
 * Hook to fetch comprehensive analytics data
 */
export const useAnalyticsData = (filters?: AnalyticsFilters) => {
  return useQuery({
    queryKey: analyticsKeys.overview(filters),
    queryFn: () => analyticsService.getAnalyticsData(filters),
    staleTime: CACHE_TIMES.DEFAULT,
  });
};

/**
 * Hook to fetch revenue trends data
 */
export const useRevenueTrends = (
  period: 'monthly' | 'quarterly',
  filters?: AnalyticsFilters,
) => {
  return useQuery({
    queryKey: analyticsKeys.revenue(period, filters),
    queryFn: () => analyticsService.getRevenueTrends(period, filters),
    staleTime: CACHE_TIMES.DEFAULT,
  });
};

/**
 * Hook to fetch tenant performance metrics
 */
export const useTenantMetrics = (filters?: AnalyticsFilters) => {
  return useQuery({
    queryKey: analyticsKeys.tenants(filters),
    queryFn: () => analyticsService.getTenantMetrics(filters),
    staleTime: CACHE_TIMES.DEFAULT,
  });
};

/**
 * Hook to fetch invoice status overview
 */
export const useInvoiceStatusOverview = (filters?: AnalyticsFilters) => {
  return useQuery({
    queryKey: analyticsKeys.invoiceStatus(filters),
    queryFn: () => analyticsService.getInvoiceStatusOverview(filters),
    staleTime: CACHE_TIMES.DEFAULT,
  });
};

/**
 * Hook to fetch payment distribution data
 */
export const usePaymentDistribution = (filters?: AnalyticsFilters) => {
  return useQuery({
    queryKey: analyticsKeys.paymentDistribution(filters),
    queryFn: () => analyticsService.getPaymentDistribution(filters),
    staleTime: CACHE_TIMES.DEFAULT,
  });
};