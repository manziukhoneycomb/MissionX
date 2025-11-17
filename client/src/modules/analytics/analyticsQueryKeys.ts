import { DateRange, AnalyticsQuery } from './types/analytics';

export const analyticsKeys = {
  all: ['analytics'] as const,
  revenueTrends: (dateRange: DateRange, groupBy: string) => 
    [...analyticsKeys.all, 'revenueTrends', dateRange, groupBy] as const,
  topCustomers: (dateRange: DateRange, limit: number) =>
    [...analyticsKeys.all, 'topCustomers', dateRange, limit] as const,
  tenantMetrics: (query: AnalyticsQuery) =>
    [...analyticsKeys.all, 'tenantMetrics', query] as const,
  invoiceStatus: (dateRange: DateRange) =>
    [...analyticsKeys.all, 'invoiceStatus', dateRange] as const,
  paymentDistribution: (dateRange: DateRange) =>
    [...analyticsKeys.all, 'paymentDistribution', dateRange] as const,
};