import axios from 'axios';
import { AnalyticsData, AnalyticsFilters } from '../types/analytics';

export const analyticsService = {
  /**
   * Get comprehensive analytics data
   * @param filters - Optional filters for date range, tenant, etc.
   * @returns Promise<AnalyticsData>
   */
  getAnalyticsData: async (filters?: AnalyticsFilters): Promise<AnalyticsData> => {
    const response = await axios.get<AnalyticsData>('/analytics', {
      params: filters,
    });
    return response.data;
  },

  /**
   * Get revenue trends data
   * @param period - 'monthly' | 'quarterly'
   * @param filters - Optional filters
   */
  getRevenueTrends: async (
    period: 'monthly' | 'quarterly',
    filters?: AnalyticsFilters,
  ) => {
    const response = await axios.get(`/analytics/revenue/${period}`, {
      params: filters,
    });
    return response.data;
  },

  /**
   * Get tenant performance metrics
   * @param filters - Optional filters
   */
  getTenantMetrics: async (filters?: AnalyticsFilters) => {
    const response = await axios.get('/analytics/tenants', {
      params: filters,
    });
    return response.data;
  },

  /**
   * Get invoice status overview
   * @param filters - Optional filters
   */
  getInvoiceStatusOverview: async (filters?: AnalyticsFilters) => {
    const response = await axios.get('/analytics/invoice-status', {
      params: filters,
    });
    return response.data;
  },

  /**
   * Get payment distribution data
   * @param filters - Optional filters
   */
  getPaymentDistribution: async (filters?: AnalyticsFilters) => {
    const response = await axios.get('/analytics/payment-distribution', {
      params: filters,
    });
    return response.data;
  },

  /**
   * Export analytics data to CSV
   * @param type - Type of data to export
   * @param filters - Optional filters
   */
  exportData: async (
    type: 'revenue' | 'tenants' | 'invoices' | 'payments',
    filters?: AnalyticsFilters,
  ): Promise<Blob> => {
    const response = await axios.get(`/analytics/export/${type}`, {
      params: filters,
      responseType: 'blob',
    });
    return response.data;
  },
};