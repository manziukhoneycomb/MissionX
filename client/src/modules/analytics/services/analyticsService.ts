import axios from 'axios';
import {
  AnalyticsQueryParams,
  AnalyticsResponse,
  RevenueTrend,
  MonthlyRevenue,
  QuarterlyRevenue,
  TenantMetrics,
  TopCustomer,
  InvoiceStatus,
  InvoiceAging,
  PaymentDistribution,
} from '../types/analytics';

export const analyticsService = {
  /**
   * Get comprehensive analytics dashboard data
   */
  getComprehensiveAnalytics: async (params?: AnalyticsQueryParams): Promise<AnalyticsResponse> => {
    const response = await axios.get<AnalyticsResponse>('/analytics', {
      params,
    });
    return response.data;
  },

  /**
   * Get revenue trends over time
   */
  getRevenueTrends: async (params?: AnalyticsQueryParams): Promise<RevenueTrend[]> => {
    const response = await axios.get<RevenueTrend[]>('/analytics/revenue/trends', {
      params,
    });
    return response.data;
  },

  /**
   * Get monthly revenue breakdown
   */
  getMonthlyRevenue: async (params?: AnalyticsQueryParams): Promise<MonthlyRevenue[]> => {
    const response = await axios.get<MonthlyRevenue[]>('/analytics/revenue/monthly', {
      params,
    });
    return response.data;
  },

  /**
   * Get quarterly revenue breakdown
   */
  getQuarterlyRevenue: async (params?: AnalyticsQueryParams): Promise<QuarterlyRevenue[]> => {
    const response = await axios.get<QuarterlyRevenue[]>('/analytics/revenue/quarterly', {
      params,
    });
    return response.data;
  },

  /**
   * Get tenant performance metrics
   */
  getTenantMetrics: async (params?: AnalyticsQueryParams): Promise<TenantMetrics[]> => {
    const response = await axios.get<TenantMetrics[]>('/analytics/tenants/metrics', {
      params,
    });
    return response.data;
  },

  /**
   * Get top customers by revenue
   */
  getTopCustomers: async (params?: AnalyticsQueryParams & { limit?: number }): Promise<TopCustomer[]> => {
    const response = await axios.get<TopCustomer[]>('/analytics/customers/top', {
      params,
    });
    return response.data;
  },

  /**
   * Get invoice status overview
   */
  getInvoiceStatus: async (params?: AnalyticsQueryParams): Promise<InvoiceStatus> => {
    const response = await axios.get<InvoiceStatus>('/analytics/invoices/status', {
      params,
    });
    return response.data;
  },

  /**
   * Get invoice aging analysis
   */
  getInvoiceAging: async (params?: AnalyticsQueryParams): Promise<InvoiceAging[]> => {
    const response = await axios.get<InvoiceAging[]>('/analytics/invoices/aging', {
      params,
    });
    return response.data;
  },

  /**
   * Get payment distribution analytics
   */
  getPaymentDistribution: async (params?: AnalyticsQueryParams): Promise<PaymentDistribution> => {
    const response = await axios.get<PaymentDistribution>('/analytics/payments/distribution', {
      params,
    });
    return response.data;
  },
};