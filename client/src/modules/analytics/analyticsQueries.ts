import { useQuery } from '@tanstack/react-query';
import { analyticsKeys } from './analyticsQueryKeys';
import { analyticsService, type DateRangeFilter } from './services/analyticsService';
import { CACHE_TIMES } from '../../common/constants/cacheTimes';

/**
 * Hook to fetch revenue trends data
 */
export const useRevenueTrends = (
  period: 'monthly' | 'quarterly' = 'monthly',
  filters?: DateRangeFilter,
) => {
  return useQuery({
    queryKey: analyticsKeys.revenueTrendsWithFilters(period, filters),
    queryFn: () => analyticsService.getRevenueTrends(period, filters),
    staleTime: CACHE_TIMES.DEFAULT,
  });
};

/**
 * Hook to fetch tenant performance metrics
 */
export const useTenantMetrics = (filters?: DateRangeFilter) => {
  return useQuery({
    queryKey: analyticsKeys.tenantMetricsWithFilters(filters),
    queryFn: () => analyticsService.getTenantMetrics(filters),
    staleTime: CACHE_TIMES.DEFAULT,
  });
};

/**
 * Hook to fetch invoice status distribution
 */
export const useInvoiceStatusDistribution = (filters?: DateRangeFilter) => {
  return useQuery({
    queryKey: analyticsKeys.invoiceStatusWithFilters(filters),
    queryFn: () => analyticsService.getInvoiceStatusDistribution(filters),
    staleTime: CACHE_TIMES.DEFAULT,
  });
};

/**
 * Hook to fetch payment method distribution
 */
export const usePaymentDistribution = (filters?: DateRangeFilter) => {
  return useQuery({
    queryKey: analyticsKeys.paymentDistributionWithFilters(filters),
    queryFn: () => analyticsService.getPaymentDistribution(filters),
    staleTime: CACHE_TIMES.DEFAULT,
  });
};

/**
 * Hook to fetch analytics summary
 */
export const useAnalyticsSummary = (filters?: DateRangeFilter) => {
  return useQuery({
    queryKey: analyticsKeys.summaryWithFilters(filters),
    queryFn: () => analyticsService.getAnalyticsSummary(filters),
    staleTime: CACHE_TIMES.DEFAULT,
  });
};