export interface RevenueMetrics {
  totalRevenue: number;
  monthlyRevenue: Array<{
    month: string;
    revenue: number;
  }>;
  quarterlyRevenue: Array<{
    quarter: string;
    revenue: number;
  }>;
}

export interface TopCustomer {
  customerName: string;
  totalRevenue: number;
  invoiceCount: number;
}

export interface PaymentDistribution {
  paid: number;
  unpaid: number;
  overdue: number;
}

export interface TenantPerformance {
  tenantId: string;
  tenantName: string;
  invoiceCount: number;
  totalRevenue: number;
  averageInvoiceValue: number;
  averagePaymentTime: number;
}

export interface InvoiceStatusOverview {
  total: number;
  paid: number;
  unpaid: number;
  overdue: number;
  paidPercentage: number;
  unpaidPercentage: number;
  overduePercentage: number;
}

export interface AgingAnalysis {
  current: number;
  days1to30: number;
  days31to60: number;
  days61to90: number;
  over90Days: number;
}

export interface AnalyticsData {
  revenueMetrics: RevenueMetrics;
  topCustomers: TopCustomer[];
  paymentDistribution: PaymentDistribution;
  tenantPerformance: TenantPerformance[];
  invoiceStatusOverview: InvoiceStatusOverview;
  agingAnalysis: AgingAnalysis;
  dateRange: {
    startDate: string;
    endDate: string;
  };
}

export interface AnalyticsQueryParams {
  startDate?: string;
  endDate?: string;
  tenantId?: string;
}