import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { analyticsKeys } from './analyticsQueryKeys';
import { analyticsService } from './services/analyticsService';
import { AnalyticsData, AnalyticsFilters } from './types/analytics';
import { CACHE_TIMES } from '../../common/constants/cacheTimes';

/**
 * Hook to fetch analytics data
 * @param filters - Optional filters for the analytics data
 * @param options - Additional query options
 */
export const useAnalytics = (
  filters?: AnalyticsFilters,
  options?: Omit<UseQueryOptions<AnalyticsData>, 'queryKey' | 'queryFn'>,
) => {
  return useQuery({
    queryKey: analyticsKeys.analytics(filters),
    queryFn: () => analyticsService.getAnalytics(filters),
    staleTime: CACHE_TIMES.DEFAULT,
    gcTime: CACHE_TIMES.DEFAULT,
    ...options,
  });
};

/**
 * Hook to fetch drill-down data for specific metrics
 * @param type - The type of drill-down data to fetch
 * @param filters - Filters for the drill-down query
 * @param enabled - Whether the query should be enabled
 */
export const useDrillDownData = (
  type: 'revenue' | 'tenant' | 'status' | 'payment',
  filters: Record<string, unknown>,
  enabled: boolean = true,
) => {
  return useQuery({
    queryKey: analyticsKeys.drillDown(type, filters),
    queryFn: () => analyticsService.getDrillDownData(type, filters),
    enabled: enabled && Object.keys(filters).length > 0,
    staleTime: CACHE_TIMES.DEFAULT,
    gcTime: CACHE_TIMES.DEFAULT,
  });
};