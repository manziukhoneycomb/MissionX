export interface AnalyticsDateRange {
  startDate: string;
  endDate: string;
}

export interface RevenueDataPoint {
  date: string;
  revenue: number;
  invoiceCount: number;
}

export interface RevenueAnalytics {
  monthlyRevenue: RevenueDataPoint[];
  quarterlyRevenue: RevenueDataPoint[];
  topCustomers: {
    customerName: string;
    totalRevenue: number;
    invoiceCount: number;
  }[];
  totalRevenue: number;
  averageInvoiceValue: number;
  revenueGrowth: number; // percentage
}

export interface TenantMetricPoint {
  tenantId: string;
  tenantName: string;
  invoiceCount: number;
  totalRevenue: number;
  averageInvoiceValue: number;
  paymentTimeliness: number; // percentage of on-time payments
}

export interface TenantAnalytics {
  tenantMetrics: TenantMetricPoint[];
  totalTenants: number;
  avgInvoicesPerTenant: number;
  topPerformingTenants: TenantMetricPoint[];
}

export interface InvoiceStatusCount {
  status: 'paid' | 'unpaid' | 'overdue';
  count: number;
  totalAmount: number;
  percentage: number;
}

export interface AgingBucket {
  range: string; // e.g., "0-30 days", "31-60 days"
  count: number;
  totalAmount: number;
}

export interface InvoiceStatusAnalytics {
  statusDistribution: InvoiceStatusCount[];
  agingAnalysis: AgingBucket[];
  totalInvoices: number;
  overdueAmount: number;
}

export interface PaymentMethodData {
  method: string;
  count: number;
  totalAmount: number;
  percentage: number;
}

export interface PaymentTrendPoint {
  date: string;
  onTime: number;
  late: number;
  percentage: number; // on-time percentage
}

export interface PaymentDistributionAnalytics {
  paymentMethods: PaymentMethodData[];
  paymentTrends: PaymentTrendPoint[];
  averagePaymentTime: number; // days
  onTimePaymentRate: number; // percentage
}

export interface AnalyticsFilters {
  dateRange?: AnalyticsDateRange;
  tenantId?: string;
  customerId?: string;
}