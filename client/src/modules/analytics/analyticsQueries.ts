import { useQuery } from '@tanstack/react-query';
import { analyticsKeys } from './analyticsQueryKeys';
import { analyticsService } from './services/analyticsService';
import { AnalyticsQueryParams } from './types/analytics';

/**
 * Hook to fetch comprehensive analytics data
 */
export const useComprehensiveAnalytics = (params?: AnalyticsQueryParams) => {
  return useQuery({
    queryKey: analyticsKeys.comprehensive(params),
    queryFn: () => analyticsService.getComprehensiveAnalytics(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
};

/**
 * Hook to fetch revenue trends
 */
export const useRevenueTrends = (params?: AnalyticsQueryParams) => {
  return useQuery({
    queryKey: analyticsKeys.revenueTrends(params),
    queryFn: () => analyticsService.getRevenueTrends(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
};

/**
 * Hook to fetch monthly revenue
 */
export const useMonthlyRevenue = (params?: AnalyticsQueryParams) => {
  return useQuery({
    queryKey: analyticsKeys.monthlyRevenue(params),
    queryFn: () => analyticsService.getMonthlyRevenue(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
};

/**
 * Hook to fetch quarterly revenue
 */
export const useQuarterlyRevenue = (params?: AnalyticsQueryParams) => {
  return useQuery({
    queryKey: analyticsKeys.quarterlyRevenue(params),
    queryFn: () => analyticsService.getQuarterlyRevenue(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
};

/**
 * Hook to fetch tenant metrics
 */
export const useTenantMetrics = (params?: AnalyticsQueryParams) => {
  return useQuery({
    queryKey: analyticsKeys.tenantMetrics(params),
    queryFn: () => analyticsService.getTenantMetrics(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
};

/**
 * Hook to fetch top customers
 */
export const useTopCustomers = (params?: AnalyticsQueryParams & { limit?: number }) => {
  return useQuery({
    queryKey: analyticsKeys.topCustomers(params),
    queryFn: () => analyticsService.getTopCustomers(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
};

/**
 * Hook to fetch invoice status
 */
export const useInvoiceStatus = (params?: AnalyticsQueryParams) => {
  return useQuery({
    queryKey: analyticsKeys.invoiceStatus(params),
    queryFn: () => analyticsService.getInvoiceStatus(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
};

/**
 * Hook to fetch invoice aging
 */
export const useInvoiceAging = (params?: AnalyticsQueryParams) => {
  return useQuery({
    queryKey: analyticsKeys.invoiceAging(params),
    queryFn: () => analyticsService.getInvoiceAging(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
};

/**
 * Hook to fetch payment distribution
 */
export const usePaymentDistribution = (params?: AnalyticsQueryParams) => {
  return useQuery({
    queryKey: analyticsKeys.paymentDistribution(params),
    queryFn: () => analyticsService.getPaymentDistribution(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
};