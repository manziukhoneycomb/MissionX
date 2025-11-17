import axios from 'axios';

export interface RevenueMetric {
  month: string;
  revenue: number;
  invoiceCount: number;
}

export interface TenantMetric {
  id: string;
  name: string;
  invoiceCount: number;
  totalRevenue: number;
  averageInvoiceValue: number;
  paymentTimeliness: number;
}

export interface InvoiceStatusData {
  paid: number;
  unpaid: number;
  overdue: number;
}

export interface PaymentDistribution {
  method: string;
  count: number;
  amount: number;
}

export interface AnalyticsResponse {
  revenue: RevenueMetric[];
  tenants: TenantMetric[];
  invoiceStatus: InvoiceStatusData;
  paymentDistribution: PaymentDistribution[];
}

export const analyticsService = {
  getAnalyticsData: async (
    startDate?: string,
    endDate?: string,
  ): Promise<AnalyticsResponse> => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);

    const response = await axios.get<AnalyticsResponse>(
      `/analytics?${params.toString()}`,
    );
    return response.data;
  },

  getRevenueData: async (
    period: 'monthly' | 'quarterly' = 'monthly',
    startDate?: string,
    endDate?: string,
  ): Promise<RevenueMetric[]> => {
    const params = new URLSearchParams({ period });
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);

    const response = await axios.get<RevenueMetric[]>(
      `/analytics/revenue?${params.toString()}`,
    );
    return response.data;
  },

  getTenantMetrics: async (
    sortBy: 'invoiceCount' | 'revenue' | 'timeliness' = 'revenue',
    order: 'asc' | 'desc' = 'desc',
  ): Promise<TenantMetric[]> => {
    const params = new URLSearchParams({ sortBy, order });
    const response = await axios.get<TenantMetric[]>(
      `/analytics/tenants?${params.toString()}`,
    );
    return response.data;
  },

  getInvoiceStatusData: async (): Promise<InvoiceStatusData> => {
    const response = await axios.get<InvoiceStatusData>('/analytics/status');
    return response.data;
  },

  getPaymentDistribution: async (
    period?: string,
  ): Promise<PaymentDistribution[]> => {
    const params = period ? new URLSearchParams({ period }) : '';
    const response = await axios.get<PaymentDistribution[]>(
      `/analytics/payments?${params.toString()}`,
    );
    return response.data;
  },
};