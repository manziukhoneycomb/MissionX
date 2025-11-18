import axios from 'axios';

export interface DateRangeFilter {
  startDate?: string;
  endDate?: string;
}

export interface RevenueData {
  period: string; // e.g., '2024-01', '2024-Q1'
  revenue: number;
  invoiceCount: number;
}

export interface TenantMetric {
  tenantId: string;
  tenantName: string;
  invoiceCount: number;
  totalRevenue: number;
  averageInvoiceValue: number;
  paymentTimeliness: number; // percentage
}

export interface InvoiceStatusDistribution {
  status: 'paid' | 'unpaid' | 'overdue';
  count: number;
  percentage: number;
  totalAmount: number;
}

export interface PaymentMethodDistribution {
  method: string;
  count: number;
  percentage: number;
  totalAmount: number;
}

export interface AnalyticsSummary {
  totalRevenue: number;
  totalInvoices: number;
  averageInvoiceValue: number;
  paymentTimeliness: number;
  topTenant: string;
  monthlyGrowth: number; // percentage
}

export interface AnalyticsResponse<T> {
  data: T;
  summary?: AnalyticsSummary;
  period: DateRangeFilter;
}

export const analyticsService = {
  /**
   * Get revenue trends over time
   */
  getRevenueTrends: async (
    period: 'monthly' | 'quarterly' = 'monthly',
    filters?: DateRangeFilter,
  ): Promise<AnalyticsResponse<RevenueData[]>> => {
    const response = await axios.get<AnalyticsResponse<RevenueData[]>>('/analytics/revenue-trends', {
      params: { period, ...filters },
    });
    return response.data;
  },

  /**
   * Get tenant performance metrics
   */
  getTenantMetrics: async (
    filters?: DateRangeFilter,
  ): Promise<AnalyticsResponse<TenantMetric[]>> => {
    const response = await axios.get<AnalyticsResponse<TenantMetric[]>>('/analytics/tenant-metrics', {
      params: { ...filters },
    });
    return response.data;
  },

  /**
   * Get invoice status distribution
   */
  getInvoiceStatusDistribution: async (
    filters?: DateRangeFilter,
  ): Promise<AnalyticsResponse<InvoiceStatusDistribution[]>> => {
    const response = await axios.get<AnalyticsResponse<InvoiceStatusDistribution[]>>('/analytics/invoice-status', {
      params: { ...filters },
    });
    return response.data;
  },

  /**
   * Get payment method distribution
   */
  getPaymentDistribution: async (
    filters?: DateRangeFilter,
  ): Promise<AnalyticsResponse<PaymentMethodDistribution[]>> => {
    const response = await axios.get<AnalyticsResponse<PaymentMethodDistribution[]>>('/analytics/payment-distribution', {
      params: { ...filters },
    });
    return response.data;
  },

  /**
   * Get comprehensive analytics summary
   */
  getAnalyticsSummary: async (
    filters?: DateRangeFilter,
  ): Promise<AnalyticsResponse<AnalyticsSummary>> => {
    const response = await axios.get<AnalyticsResponse<AnalyticsSummary>>('/analytics/summary', {
      params: { ...filters },
    });
    return response.data;
  },

  /**
   * Export analytics data to CSV
   */
  exportData: async (
    type: 'revenue' | 'tenants' | 'status' | 'payments',
    filters?: DateRangeFilter,
  ): Promise<Blob> => {
    const response = await axios.get(`/analytics/export/${type}`, {
      params: { ...filters },
      responseType: 'blob',
    });
    return response.data;
  },
};