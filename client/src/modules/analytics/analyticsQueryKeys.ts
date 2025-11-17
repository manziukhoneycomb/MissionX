import { AnalyticsQuery } from './types/analytics';

export const analyticsKeys = {
  all: ['analytics'] as const,
  
  revenueTrends: (query: AnalyticsQuery) => 
    [...analyticsKeys.all, 'revenue-trends', query] as const,
  
  topCustomers: (query: AnalyticsQuery, limit: number) => 
    [...analyticsKeys.all, 'top-customers', query, limit] as const,
  
  tenantPerformance: (query: AnalyticsQuery) => 
    [...analyticsKeys.all, 'tenant-performance', query] as const,
  
  invoiceStatus: (query: AnalyticsQuery) => 
    [...analyticsKeys.all, 'invoice-status', query] as const,
  
  paymentDistribution: (query: AnalyticsQuery) => 
    [...analyticsKeys.all, 'payment-distribution', query] as const,
};