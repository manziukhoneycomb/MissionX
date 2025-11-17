import { AnalyticsQueryDto } from './types/analytics';

export const analyticsKeys = {
  all: ['analytics'] as const,
  overview: (query: AnalyticsQueryDto) => [...analyticsKeys.all, 'overview', query] as const,
  revenue: (query: AnalyticsQueryDto) => [...analyticsKeys.all, 'revenue', query] as const,
  tenants: (query: AnalyticsQueryDto) => [...analyticsKeys.all, 'tenants', query] as const,
  invoiceStatus: (query: AnalyticsQueryDto) => [...analyticsKeys.all, 'invoice-status', query] as const,
  payments: (query: AnalyticsQueryDto) => [...analyticsKeys.all, 'payments', query] as const,
};