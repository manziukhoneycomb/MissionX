import axios from 'axios';
import {
  AnalyticsResponseDto,
  RevenueMetricsDto,
  TopTenantsDto,
  InvoiceStatusDto,
  PaymentDistributionDto,
  AnalyticsQueryDto,
} from '../types/analytics';

export const analyticsService = {
  /**
   * Get comprehensive analytics overview
   */
  getAnalyticsOverview: async (query: AnalyticsQueryDto = {}): Promise<AnalyticsResponseDto> => {
    const response = await axios.get<AnalyticsResponseDto>('/analytics/overview', {
      params: query,
    });
    return response.data;
  },

  /**
   * Get detailed revenue metrics and trends
   */
  getRevenueMetrics: async (query: AnalyticsQueryDto = {}): Promise<RevenueMetricsDto> => {
    const response = await axios.get<RevenueMetricsDto>('/analytics/revenue', {
      params: query,
    });
    return response.data;
  },

  /**
   * Get tenant performance metrics
   */
  getTenantMetrics: async (query: AnalyticsQueryDto = {}): Promise<TopTenantsDto> => {
    const response = await axios.get<TopTenantsDto>('/analytics/tenants', {
      params: query,
    });
    return response.data;
  },

  /**
   * Get invoice status breakdown and aging analysis
   */
  getInvoiceStatusMetrics: async (query: AnalyticsQueryDto = {}): Promise<InvoiceStatusDto> => {
    const response = await axios.get<InvoiceStatusDto>('/analytics/invoice-status', {
      params: query,
    });
    return response.data;
  },

  /**
   * Get payment distribution and volume data
   */
  getPaymentDistribution: async (query: AnalyticsQueryDto = {}): Promise<PaymentDistributionDto> => {
    const response = await axios.get<PaymentDistributionDto>('/analytics/payments', {
      params: query,
    });
    return response.data;
  },
};