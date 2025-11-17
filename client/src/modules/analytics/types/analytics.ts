export interface DateRange {
  startDate: string;
  endDate: string;
}

export interface AnalyticsQuery {
  dateRange: DateRange;
  tenantIds?: string[];
}

export interface MetricSummary {
  name: string;
  value: number;
  changePercent?: number;
  previousValue?: number;
}

// Revenue Trend Types
export interface RevenueTrendPoint {
  period: string;
  revenue: number;
  invoiceCount: number;
  date: string;
}

export interface RevenueTrend {
  data: RevenueTrendPoint[];
  totalRevenue: number;
  totalInvoices: number;
  averageRevenuePerPeriod: number;
  periodType: string;
}

export interface TopCustomer {
  customerName: string;
  totalRevenue: number;
  invoiceCount: number;
  averageInvoiceValue: number;
  rank: number;
}

// Tenant Metrics Types
export interface TenantMetric {
  tenantId: string;
  tenantName?: string;
  invoiceCount: number;
  totalRevenue: number;
  averageInvoiceValue: number;
  paidInvoices: number;
  unpaidInvoices: number;
  overdueInvoices: number;
  paymentSuccessRate: number;
  averageDaysToPayment?: number;
}

export interface TenantPerformance {
  tenants: TenantMetric[];
  totalInvoices: number;
  totalRevenue: number;
  averageInvoicesPerTenant: number;
  topTenant: TenantMetric;
}

// Invoice Status Types
export interface InvoiceStatusCount {
  status: string;
  count: number;
  totalAmount: number;
  percentage: number;
}

export interface AgingBucket {
  ageRange: string;
  minDays: number;
  maxDays: number;
  count: number;
  totalAmount: number;
  percentage: number;
}

export interface InvoiceStatusOverview {
  statusCounts: InvoiceStatusCount[];
  agingAnalysis: AgingBucket[];
  totalInvoices: number;
  totalAmount: number;
  paidAmount: number;
  unpaidAmount: number;
  collectionRate: number;
}

// Payment Distribution Types
export interface PaymentMethod {
  method: string;
  count: number;
  totalAmount: number;
  percentage: number;
  averageAmount: number;
}

export interface PaymentTiming {
  category: string;
  count: number;
  totalAmount: number;
  percentage: number;
  averageDays: number;
}

export interface PaymentDistribution {
  paymentMethods: PaymentMethod[];
  paymentTiming: PaymentTiming[];
  totalPayments: number;
  totalAmount: number;
  averagePaymentAmount: number;
  averageDaysToPayment: number;
}

// Chart Data Types for Victory
export interface ChartDataPoint {
  x: string | number;
  y: number;
  label?: string;
  [key: string]: any;
}

export interface ChartFilter {
  startDate: string;
  endDate: string;
  selectedTenants: string[];
}