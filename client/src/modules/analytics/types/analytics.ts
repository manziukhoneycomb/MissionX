export interface RevenueData {
  date: string;
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

export interface InvoiceStatusData {
  status: 'paid' | 'unpaid' | 'overdue';
  count: number;
  percentage: number;
  totalAmount: number;
}

export interface PaymentDistribution {
  method: string;
  count: number;
  amount: number;
  percentage: number;
}

export interface AnalyticsData {
  revenue: RevenueData[];
  tenantMetrics: TenantMetric[];
  invoiceStatus: InvoiceStatusData[];
  paymentDistribution: PaymentDistribution[];
}

export interface AnalyticsFilters {
  dateRange: {
    start: string;
    end: string;
  };
  tenantIds?: string[];
  status?: string[];
}