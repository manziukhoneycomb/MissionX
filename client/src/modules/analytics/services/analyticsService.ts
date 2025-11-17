import axios from 'axios';
import {
  AnalyticsQuery,
  RevenueTrend,
  TopCustomer,
  TenantPerformance,
  InvoiceStatusOverview,
  PaymentDistribution,
} from '../types/analytics';

export const analyticsService = {
  /**
   * Get revenue trends over time with monthly aggregation
   */
  getRevenueTrends: async (query: AnalyticsQuery): Promise<RevenueTrend> => {
    const params = new URLSearchParams();
    params.append('startDate', query.dateRange.startDate);
    params.append('endDate', query.dateRange.endDate);
    
    if (query.tenantIds && query.tenantIds.length > 0) {
      query.tenantIds.forEach(id => params.append('tenantIds', id));
    }

    const response = await axios.get<RevenueTrend>(`/analytics/revenue-trends?${params.toString()}`);
    return response.data;
  },

  /**
   * Get top customers by revenue
   */
  getTopCustomers: async (
    query: AnalyticsQuery, 
    limit: number = 10
  ): Promise<TopCustomer[]> => {
    const params = new URLSearchParams();
    params.append('startDate', query.dateRange.startDate);
    params.append('endDate', query.dateRange.endDate);
    params.append('limit', limit.toString());
    
    if (query.tenantIds && query.tenantIds.length > 0) {
      query.tenantIds.forEach(id => params.append('tenantIds', id));
    }

    const response = await axios.get<TopCustomer[]>(`/analytics/top-customers?${params.toString()}`);
    return response.data;
  },

  /**
   * Get tenant performance metrics
   */
  getTenantPerformance: async (query: AnalyticsQuery): Promise<TenantPerformance> => {
    const params = new URLSearchParams();
    params.append('startDate', query.dateRange.startDate);
    params.append('endDate', query.dateRange.endDate);
    
    if (query.tenantIds && query.tenantIds.length > 0) {
      query.tenantIds.forEach(id => params.append('tenantIds', id));
    }

    const response = await axios.get<TenantPerformance>(`/analytics/tenant-performance?${params.toString()}`);
    return response.data;
  },

  /**
   * Get invoice status overview with aging analysis
   */
  getInvoiceStatusOverview: async (query: AnalyticsQuery): Promise<InvoiceStatusOverview> => {
    const params = new URLSearchParams();
    params.append('startDate', query.dateRange.startDate);
    params.append('endDate', query.dateRange.endDate);
    
    if (query.tenantIds && query.tenantIds.length > 0) {
      query.tenantIds.forEach(id => params.append('tenantIds', id));
    }

    const response = await axios.get<InvoiceStatusOverview>(`/analytics/invoice-status?${params.toString()}`);
    return response.data;
  },

  /**
   * Get payment distribution analytics
   */
  getPaymentDistribution: async (query: AnalyticsQuery): Promise<PaymentDistribution> => {
    const params = new URLSearchParams();
    params.append('startDate', query.dateRange.startDate);
    params.append('endDate', query.dateRange.endDate);
    
    if (query.tenantIds && query.tenantIds.length > 0) {
      query.tenantIds.forEach(id => params.append('tenantIds', id));
    }

    const response = await axios.get<PaymentDistribution>(`/analytics/payment-distribution?${params.toString()}`);
    return response.data;
  },
};