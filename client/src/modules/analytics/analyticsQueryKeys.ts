import { AnalyticsQueryParams } from './types/analytics';

export const analyticsKeys = {
  all: ['analytics'] as const,
  comprehensive: (params?: AnalyticsQueryParams) => [...analyticsKeys.all, 'comprehensive', params] as const,
  revenueTrends: (params?: AnalyticsQueryParams) => [...analyticsKeys.all, 'revenue-trends', params] as const,
  monthlyRevenue: (params?: AnalyticsQueryParams) => [...analyticsKeys.all, 'monthly-revenue', params] as const,
  quarterlyRevenue: (params?: AnalyticsQueryParams) => [...analyticsKeys.all, 'quarterly-revenue', params] as const,
  tenantMetrics: (params?: AnalyticsQueryParams) => [...analyticsKeys.all, 'tenant-metrics', params] as const,
  topCustomers: (params?: AnalyticsQueryParams & { limit?: number }) => [...analyticsKeys.all, 'top-customers', params] as const,
  invoiceStatus: (params?: AnalyticsQueryParams) => [...analyticsKeys.all, 'invoice-status', params] as const,
  invoiceAging: (params?: AnalyticsQueryParams) => [...analyticsKeys.all, 'invoice-aging', params] as const,
  paymentDistribution: (params?: AnalyticsQueryParams) => [...analyticsKeys.all, 'payment-distribution', params] as const,
};