import { useQuery } from '@tanstack/react-query';
import { analyticsService } from './services/analyticsService';
import { AnalyticsQuery } from './types/analytics';
import { ANALYTICS_QUERY_KEYS } from './analyticsQueryKeys';
import { CACHE_TIMES } from '../../common/constants/cacheTimes';

export const useAnalytics = (query: AnalyticsQuery = {}) => {
    return useQuery({
        queryKey: [ANALYTICS_QUERY_KEYS.GET_ANALYTICS, query],
        queryFn: () => analyticsService.getAnalytics(query),
        staleTime: CACHE_TIMES.DEFAULT,
    });
};

export const useRevenueMetrics = (query: AnalyticsQuery = {}) => {
    return useQuery({
        queryKey: [ANALYTICS_QUERY_KEYS.GET_REVENUE_METRICS, query],
        queryFn: () => analyticsService.getRevenueMetrics(query),
        staleTime: CACHE_TIMES.DEFAULT,
    });
};

export const useTenantPerformance = (query: AnalyticsQuery = {}) => {
    return useQuery({
        queryKey: [ANALYTICS_QUERY_KEYS.GET_TENANT_PERFORMANCE, query],
        queryFn: () => analyticsService.getTenantPerformance(query),
        staleTime: CACHE_TIMES.DEFAULT,
    });
};

export const useInvoiceStatusOverview = (query: AnalyticsQuery = {}) => {
    return useQuery({
        queryKey: [ANALYTICS_QUERY_KEYS.GET_INVOICE_STATUS, query],
        queryFn: () => analyticsService.getInvoiceStatusOverview(query),
        staleTime: CACHE_TIMES.DEFAULT,
    });
};

export const usePaymentDistribution = (query: AnalyticsQuery = {}) => {
    return useQuery({
        queryKey: [ANALYTICS_QUERY_KEYS.GET_PAYMENT_DISTRIBUTION, query],
        queryFn: () => analyticsService.getPaymentDistribution(query),
        staleTime: CACHE_TIMES.DEFAULT,
    });
};