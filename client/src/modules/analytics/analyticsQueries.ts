import { useQuery } from '@tanstack/react-query';
import { analyticsKeys } from './analyticsQueryKeys';
import { analyticsService } from './services/analyticsService';
import { AnalyticsQueryDto } from './types/analytics';

/**
 * Hook to fetch comprehensive analytics overview
 */
export const useAnalyticsOverview = (query: AnalyticsQueryDto = {}) => {
  return useQuery({
    queryKey: analyticsKeys.overview(query),
    queryFn: () => analyticsService.getAnalyticsOverview(query),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
};

/**
 * Hook to fetch revenue metrics and trends
 */
export const useRevenueMetrics = (query: AnalyticsQueryDto = {}) => {
  return useQuery({
    queryKey: analyticsKeys.revenue(query),
    queryFn: () => analyticsService.getRevenueMetrics(query),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
};

/**
 * Hook to fetch tenant performance metrics
 */
export const useTenantMetrics = (query: AnalyticsQueryDto = {}) => {
  return useQuery({
    queryKey: analyticsKeys.tenants(query),
    queryFn: () => analyticsService.getTenantMetrics(query),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
};

/**
 * Hook to fetch invoice status metrics
 */
export const useInvoiceStatusMetrics = (query: AnalyticsQueryDto = {}) => {
  return useQuery({
    queryKey: analyticsKeys.invoiceStatus(query),
    queryFn: () => analyticsService.getInvoiceStatusMetrics(query),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
};

/**
 * Hook to fetch payment distribution data
 */
export const usePaymentDistribution = (query: AnalyticsQueryDto = {}) => {
  return useQuery({
    queryKey: analyticsKeys.payments(query),
    queryFn: () => analyticsService.getPaymentDistribution(query),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
};