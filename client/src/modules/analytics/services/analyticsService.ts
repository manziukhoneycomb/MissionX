import axios from 'axios';
import { AnalyticsData, AnalyticsFilters } from '../types/analytics';

export const analyticsService = {
  getAnalyticsData: async (filters?: AnalyticsFilters): Promise<AnalyticsData> => {
    const response = await axios.get<AnalyticsData>('/analytics', {
      params: filters,
    });
    return response.data;
  },

  getRevenueMetrics: async (filters?: AnalyticsFilters) => {
    const response = await axios.get('/analytics/revenue', {
      params: filters,
    });
    return response.data;
  },

  getTenantMetrics: async (filters?: AnalyticsFilters) => {
    const response = await axios.get('/analytics/tenants', {
      params: filters,
    });
    return response.data;
  },

  getInvoiceStatusMetrics: async (filters?: AnalyticsFilters) => {
    const response = await axios.get('/analytics/invoice-status', {
      params: filters,
    });
    return response.data;
  },

  getPaymentDistribution: async (filters?: AnalyticsFilters) => {
    const response = await axios.get('/analytics/payment-distribution', {
      params: filters,
    });
    return response.data;
  },

  exportAnalyticsData: async (format: 'csv' | 'xlsx', filters?: AnalyticsFilters): Promise<Blob> => {
    const response = await axios.get(`/analytics/export/${format}`, {
      params: filters,
      responseType: 'blob',
    });
    return response.data;
  },
};