import { AnalyticsFilters } from './types/analytics';

export const analyticsKeys = {
  all: ['analytics'] as const,
  data: (filters?: AnalyticsFilters) => [...analyticsKeys.all, 'data', filters] as const,
  revenue: (filters?: AnalyticsFilters) => [...analyticsKeys.all, 'revenue', filters] as const,
  tenants: (filters?: AnalyticsFilters) => [...analyticsKeys.all, 'tenants', filters] as const,
  invoiceStatus: (filters?: AnalyticsFilters) => [...analyticsKeys.all, 'invoiceStatus', filters] as const,
  paymentDistribution: (filters?: AnalyticsFilters) => [...analyticsKeys.all, 'paymentDistribution', filters] as const,
};