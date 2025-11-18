import type { DateRangeFilter } from './services/analyticsService';

export const analyticsKeys = {
  all: ['analytics'] as const,

  revenueTrends: () => [...analyticsKeys.all, 'revenue-trends'] as const,
  revenueTrendsWithFilters: (period: string, filters?: DateRangeFilter) =>
    [...analyticsKeys.revenueTrends(), { period, ...filters }] as const,

  tenantMetrics: () => [...analyticsKeys.all, 'tenant-metrics'] as const,
  tenantMetricsWithFilters: (filters?: DateRangeFilter) =>
    [...analyticsKeys.tenantMetrics(), { ...filters }] as const,

  invoiceStatus: () => [...analyticsKeys.all, 'invoice-status'] as const,
  invoiceStatusWithFilters: (filters?: DateRangeFilter) =>
    [...analyticsKeys.invoiceStatus(), { ...filters }] as const,

  paymentDistribution: () => [...analyticsKeys.all, 'payment-distribution'] as const,
  paymentDistributionWithFilters: (filters?: DateRangeFilter) =>
    [...analyticsKeys.paymentDistribution(), { ...filters }] as const,

  summary: () => [...analyticsKeys.all, 'summary'] as const,
  summaryWithFilters: (filters?: DateRangeFilter) =>
    [...analyticsKeys.summary(), { ...filters }] as const,
};