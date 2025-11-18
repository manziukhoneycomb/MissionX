import axios from 'axios';

export interface RevenueData {
  date: string;
  revenue: number;
  invoiceCount: number;
}

export interface TenantMetrics {
  tenantId: string;
  tenantName: string;
  invoiceCount: number;
  totalRevenue: number;
  averageInvoiceValue: number;
  paymentTimeliness: number;
}

export interface InvoiceStatusData {
  status: 'paid' | 'unpaid' | 'overdue';
  count: number;
  percentage: number;
  totalAmount: number;
}

export interface PaymentDistribution {
  paymentMethod: string;
  count: number;
  totalAmount: number;
  percentage: number;
}

export interface AnalyticsFilters {
  startDate?: string;
  endDate?: string;
  tenantId?: string;
}

export const analyticsService = {
  getRevenueData: async (filters?: AnalyticsFilters): Promise<RevenueData[]> => {
    const response = await axios.get<RevenueData[]>('/analytics/revenue', {
      params: filters,
    });
    return response.data;
  },

  getTenantMetrics: async (filters?: AnalyticsFilters): Promise<TenantMetrics[]> => {
    const response = await axios.get<TenantMetrics[]>('/analytics/tenants', {
      params: filters,
    });
    return response.data;
  },

  getInvoiceStatusData: async (filters?: AnalyticsFilters): Promise<InvoiceStatusData[]> => {
    const response = await axios.get<InvoiceStatusData[]>('/analytics/invoice-status', {
      params: filters,
    });
    return response.data;
  },

  getPaymentDistribution: async (filters?: AnalyticsFilters): Promise<PaymentDistribution[]> => {
    const response = await axios.get<PaymentDistribution[]>('/analytics/payment-distribution', {
      params: filters,
    });
    return response.data;
  },
};