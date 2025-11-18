import { AnalyticsFilters } from './services/analyticsService';

export const analyticsKeys = {
  all: ['analytics'] as const,
  revenue: (filters?: AnalyticsFilters) => ['analytics', 'revenue', filters] as const,
  tenants: (filters?: AnalyticsFilters) => ['analytics', 'tenants', filters] as const,
  invoiceStatus: (filters?: AnalyticsFilters) => ['analytics', 'invoice-status', filters] as const,
  paymentDistribution: (filters?: AnalyticsFilters) => ['analytics', 'payment-distribution', filters] as const,
};