import axios from 'axios';
import {
  DateRange,
  AnalyticsQuery,
  RevenueTrendResponse,
  TopCustomer,
  TenantMetricsResponse,
  InvoiceStatusResponse,
  PaymentDistributionResponse,
} from '../types/analytics';

export const analyticsService = {
  /**
   * Get revenue trends over time
   * @param dateRange - Start and end dates
   * @param groupBy - Group by period (month, quarter, year)
   * @returns Promise<RevenueTrendResponse>
   */
  getRevenueTrends: async (
    dateRange: DateRange,
    groupBy: 'month' | 'quarter' | 'year' = 'month'
  ): Promise<RevenueTrendResponse> => {
    const response = await axios.get<RevenueTrendResponse>('/analytics/revenue-trends', {
      params: {
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
        groupBy,
      },
    });
    return response.data;
  },

  /**
   * Get top customers by revenue
   * @param dateRange - Start and end dates
   * @param limit - Number of top customers to return
   * @returns Promise<TopCustomer[]>
   */
  getTopCustomers: async (
    dateRange: DateRange,
    limit: number = 10
  ): Promise<TopCustomer[]> => {
    const response = await axios.get<TopCustomer[]>('/analytics/top-customers', {
      params: {
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
        limit,
      },
    });
    return response.data;
  },

  /**
   * Get tenant performance metrics
   * @param query - Analytics query parameters with pagination
   * @returns Promise<TenantMetricsResponse>
   */
  getTenantMetrics: async (query: AnalyticsQuery): Promise<TenantMetricsResponse> => {
    const response = await axios.get<TenantMetricsResponse>('/analytics/tenant-metrics', {
      params: {
        startDate: query.startDate,
        endDate: query.endDate,
        page: query.page,
        limit: query.limit,
      },
    });
    return response.data;
  },

  /**
   * Get invoice status overview
   * @param dateRange - Start and end dates
   * @returns Promise<InvoiceStatusResponse>
   */
  getInvoiceStatusOverview: async (dateRange: DateRange): Promise<InvoiceStatusResponse> => {
    const response = await axios.get<InvoiceStatusResponse>('/analytics/invoice-status', {
      params: {
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
      },
    });
    return response.data;
  },

  /**
   * Get payment distribution analysis
   * @param dateRange - Start and end dates
   * @returns Promise<PaymentDistributionResponse>
   */
  getPaymentDistribution: async (dateRange: DateRange): Promise<PaymentDistributionResponse> => {
    const response = await axios.get<PaymentDistributionResponse>('/analytics/payment-distribution', {
      params: {
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
      },
    });
    return response.data;
  },
};