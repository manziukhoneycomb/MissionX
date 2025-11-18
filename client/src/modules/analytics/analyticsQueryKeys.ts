import { AnalyticsFilters } from './types/analytics';

export const analyticsKeys = {
  all: ['analytics'] as const,
  overview: (filters?: AnalyticsFilters) =>
    [...analyticsKeys.all, 'overview', filters] as const,
  revenue: (period: 'monthly' | 'quarterly', filters?: AnalyticsFilters) =>
    [...analyticsKeys.all, 'revenue', period, filters] as const,
  tenants: (filters?: AnalyticsFilters) =>
    [...analyticsKeys.all, 'tenants', filters] as const,
  invoiceStatus: (filters?: AnalyticsFilters) =>
    [...analyticsKeys.all, 'invoice-status', filters] as const,
  paymentDistribution: (filters?: AnalyticsFilters) =>
    [...analyticsKeys.all, 'payment-distribution', filters] as const,
};