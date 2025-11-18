import { useQuery } from '@tanstack/react-query';
import { analyticsService } from './services/analyticsService';
import { ANALYTICS_QUERY_KEYS } from './analyticsQueryKeys';
import { DateRange } from './types/analytics';
import { CACHE_TIMES } from '../../common/constants/cacheTimes';

export const useAnalyticsOverview = () => {
  return useQuery({
    queryKey: [ANALYTICS_QUERY_KEYS.OVERVIEW],
    queryFn: () => analyticsService.getOverview(),
    staleTime: CACHE_TIMES.SHORT,
  });
};

export const useRevenueMetrics = (dateRange?: DateRange) => {
  return useQuery({
    queryKey: [ANALYTICS_QUERY_KEYS.REVENUE_METRICS, dateRange],
    queryFn: () => analyticsService.getRevenueMetrics(dateRange),
    staleTime: CACHE_TIMES.SHORT,
  });
};

export const useTenantMetrics = (dateRange?: DateRange) => {
  return useQuery({
    queryKey: [ANALYTICS_QUERY_KEYS.TENANT_METRICS, dateRange],
    queryFn: () => analyticsService.getTenantMetrics(dateRange),
    staleTime: CACHE_TIMES.SHORT,
  });
};

export const useInvoiceStatusMetrics = () => {
  return useQuery({
    queryKey: [ANALYTICS_QUERY_KEYS.INVOICE_STATUS],
    queryFn: () => analyticsService.getInvoiceStatusMetrics(),
    staleTime: CACHE_TIMES.SHORT,
  });
};

export const usePaymentMetrics = (dateRange?: DateRange) => {
  return useQuery({
    queryKey: [ANALYTICS_QUERY_KEYS.PAYMENT_METRICS, dateRange],
    queryFn: () => analyticsService.getPaymentMetrics(dateRange),
    staleTime: CACHE_TIMES.SHORT,
  });
};