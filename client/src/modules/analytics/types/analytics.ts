export interface RevenueData {
  period: string;
  revenue: number;
  previousPeriodRevenue?: number;
}

export interface TenantMetric {
  tenantId: string;
  tenantName: string;
  invoiceCount: number;
  averageInvoiceValue: number;
  totalRevenue: number;
  paymentTimeliness: number; // percentage
}

export interface InvoiceStatusData {
  status: 'paid' | 'unpaid' | 'overdue';
  count: number;
  percentage: number;
  totalValue: number;
}

export interface PaymentDistribution {
  method: string;
  count: number;
  totalValue: number;
  percentage: number;
}

export interface AgingAnalysis {
  range: string; // e.g., '0-30 days', '31-60 days'
  count: number;
  totalValue: number;
}

export interface AnalyticsData {
  revenueMetrics: {
    monthlyTrends: RevenueData[];
    quarterlyTrends: RevenueData[];
    topCustomers: Array<{
      customerId: string;
      customerName: string;
      totalRevenue: number;
      invoiceCount: number;
    }>;
  };
  tenantPerformance: TenantMetric[];
  invoiceStatusOverview: {
    statusCounts: InvoiceStatusData[];
    agingAnalysis: AgingAnalysis[];
  };
  paymentDistribution: PaymentDistribution[];
}

export interface AnalyticsFilters {
  dateRange?: {
    startDate: string;
    endDate: string;
  };
  tenantId?: string;
  customerId?: string;
}