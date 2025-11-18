import axios from 'axios';
import {
  RevenueAnalytics,
  TenantAnalytics,
  InvoiceStatusAnalytics,
  PaymentDistributionAnalytics,
  AnalyticsDateRange,
} from '../types/analytics';

export const analyticsService = {
  /**
   * Get revenue analytics data
   */
  getRevenueAnalytics: async (dateRange?: AnalyticsDateRange): Promise<RevenueAnalytics> => {
    const params = dateRange ? {
      startDate: dateRange.startDate,
      endDate: dateRange.endDate,
    } : {};

    const response = await axios.get<RevenueAnalytics>('/analytics/revenue', { params });
    return response.data;
  },

  /**
   * Get tenant performance analytics
   */
  getTenantAnalytics: async (dateRange?: AnalyticsDateRange): Promise<TenantAnalytics> => {
    const params = dateRange ? {
      startDate: dateRange.startDate,
      endDate: dateRange.endDate,
    } : {};

    const response = await axios.get<TenantAnalytics>('/analytics/tenants', { params });
    return response.data;
  },

  /**
   * Get invoice status analytics
   */
  getInvoiceStatusAnalytics: async (dateRange?: AnalyticsDateRange): Promise<InvoiceStatusAnalytics> => {
    const params = dateRange ? {
      startDate: dateRange.startDate,
      endDate: dateRange.endDate,
    } : {};

    const response = await axios.get<InvoiceStatusAnalytics>('/analytics/invoice-status', { params });
    return response.data;
  },

  /**
   * Get payment distribution analytics
   */
  getPaymentDistributionAnalytics: async (dateRange?: AnalyticsDateRange): Promise<PaymentDistributionAnalytics> => {
    const params = dateRange ? {
      startDate: dateRange.startDate,
      endDate: dateRange.endDate,
    } : {};

    const response = await axios.get<PaymentDistributionAnalytics>('/analytics/payment-distribution', { params });
    return response.data;
  },
};