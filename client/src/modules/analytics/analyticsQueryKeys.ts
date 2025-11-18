import { AnalyticsFilters } from './types/analytics';

export const analyticsKeys = {
  all: ['analytics'] as const,
  analytics: (filters?: AnalyticsFilters) => ['analytics', 'data', filters] as const,
  drillDown: (type: string, filters: Record<string, unknown>) => ['analytics', 'drill-down', type, filters] as const,
};