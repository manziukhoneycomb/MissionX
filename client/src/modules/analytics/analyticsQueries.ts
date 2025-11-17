import { useQuery } from '@tanstack/react-query';
import { analyticsKeys } from './analyticsQueryKeys';
import { analyticsService } from './services/analyticsService';
import { DateRange, AnalyticsQuery } from './types/analytics';

/**
 * Hook to fetch revenue trends
 * @param dateRange - Start and end dates
 * @param groupBy - Group by period (month, quarter, year)
 * @param enabled - Whether the query should be enabled
 */
export const useRevenueTrends = (
  dateRange: DateRange,
  groupBy: 'month' | 'quarter' | 'year' = 'month',
  enabled: boolean = true
) => {
  return useQuery({
    queryKey: analyticsKeys.revenueTrends(dateRange, groupBy),
    queryFn: () => analyticsService.getRevenueTrends(dateRange, groupBy),
    enabled: enabled && !!dateRange.startDate && !!dateRange.endDate,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Hook to fetch top customers
 * @param dateRange - Start and end dates
 * @param limit - Number of top customers to return
 * @param enabled - Whether the query should be enabled
 */
export const useTopCustomers = (
  dateRange: DateRange,
  limit: number = 10,
  enabled: boolean = true
) => {
  return useQuery({
    queryKey: analyticsKeys.topCustomers(dateRange, limit),
    queryFn: () => analyticsService.getTopCustomers(dateRange, limit),
    enabled: enabled && !!dateRange.startDate && !!dateRange.endDate,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Hook to fetch tenant metrics
 * @param query - Analytics query parameters
 * @param enabled - Whether the query should be enabled
 */
export const useTenantMetrics = (
  query: AnalyticsQuery,
  enabled: boolean = true
) => {
  return useQuery({
    queryKey: analyticsKeys.tenantMetrics(query),
    queryFn: () => analyticsService.getTenantMetrics(query),
    enabled: enabled && !!query.startDate && !!query.endDate,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Hook to fetch invoice status overview
 * @param dateRange - Start and end dates
 * @param enabled - Whether the query should be enabled
 */
export const useInvoiceStatusOverview = (
  dateRange: DateRange,
  enabled: boolean = true
) => {
  return useQuery({
    queryKey: analyticsKeys.invoiceStatus(dateRange),
    queryFn: () => analyticsService.getInvoiceStatusOverview(dateRange),
    enabled: enabled && !!dateRange.startDate && !!dateRange.endDate,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Hook to fetch payment distribution
 * @param dateRange - Start and end dates
 * @param enabled - Whether the query should be enabled
 */
export const usePaymentDistribution = (
  dateRange: DateRange,
  enabled: boolean = true
) => {
  return useQuery({
    queryKey: analyticsKeys.paymentDistribution(dateRange),
    queryFn: () => analyticsService.getPaymentDistribution(dateRange),
    enabled: enabled && !!dateRange.startDate && !!dateRange.endDate,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};