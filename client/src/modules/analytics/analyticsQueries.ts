import { useQuery } from '@tanstack/react-query';
import { analyticsKeys } from './analyticsQueryKeys';
import { analyticsService } from './services/analyticsService';
import { AnalyticsQuery } from './types/analytics';

/**
 * Hook to fetch revenue trends
 */
export const useRevenueTrends = (query: AnalyticsQuery, enabled: boolean = true) => {
  return useQuery({
    queryKey: analyticsKeys.revenueTrends(query),
    queryFn: () => analyticsService.getRevenueTrends(query),
    enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });
};

/**
 * Hook to fetch top customers
 */
export const useTopCustomers = (
  query: AnalyticsQuery, 
  limit: number = 10, 
  enabled: boolean = true
) => {
  return useQuery({
    queryKey: analyticsKeys.topCustomers(query, limit),
    queryFn: () => analyticsService.getTopCustomers(query, limit),
    enabled,
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
  });
};

/**
 * Hook to fetch tenant performance metrics
 */
export const useTenantPerformance = (query: AnalyticsQuery, enabled: boolean = true) => {
  return useQuery({
    queryKey: analyticsKeys.tenantPerformance(query),
    queryFn: () => analyticsService.getTenantPerformance(query),
    enabled,
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
  });
};

/**
 * Hook to fetch invoice status overview
 */
export const useInvoiceStatusOverview = (query: AnalyticsQuery, enabled: boolean = true) => {
  return useQuery({
    queryKey: analyticsKeys.invoiceStatus(query),
    queryFn: () => analyticsService.getInvoiceStatusOverview(query),
    enabled,
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
  });
};

/**
 * Hook to fetch payment distribution
 */
export const usePaymentDistribution = (query: AnalyticsQuery, enabled: boolean = true) => {
  return useQuery({
    queryKey: analyticsKeys.paymentDistribution(query),
    queryFn: () => analyticsService.getPaymentDistribution(query),
    enabled,
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
  });
};