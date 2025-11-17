export interface DateRange {
  startDate: string;
  endDate: string;
}

export interface AnalyticsQuery extends DateRange {
  page?: number;
  limit?: number;
}

export interface MetricDataPoint {
  period: string;
  value: number;
  label?: string;
}

export interface AnalyticsMeta {
  total: number;
  dateRange: DateRange;
  generatedAt: string;
}

export interface BaseAnalyticsResponse {
  data: MetricDataPoint[];
  meta: AnalyticsMeta;
}

// Revenue Analytics
export interface RevenueDataPoint extends MetricDataPoint {
  revenue: number;
  invoiceCount: number;
  avgInvoiceValue: number;
}

export interface RevenueTrendResponse extends BaseAnalyticsResponse {
  data: RevenueDataPoint[];
}

export interface TopCustomer {
  customerName: string;
  totalRevenue: number;
  invoiceCount: number;
  revenuePercentage: number;
}

// Tenant Metrics
export interface TenantPerformance {
  tenantId: string;
  tenantName?: string;
  invoiceCount: number;
  totalRevenue: number;
  avgInvoiceValue: number;
  paidInvoices: number;
  pendingInvoices: number;
  overdueInvoices: number;
  paymentTimeliness: number;
}

export interface TenantMetricsResponse extends BaseAnalyticsResponse {
  tenants: TenantPerformance[];
}

// Invoice Status
export enum InvoiceStatus {
  PAID = 'paid',
  PENDING = 'pending',
  OVERDUE = 'overdue',
}

export interface InvoiceStatusCount {
  status: InvoiceStatus;
  count: number;
  totalValue: number;
  percentage: number;
}

export interface AgingBucket {
  bucket: string;
  count: number;
  totalValue: number;
  daysRange: {
    min: number;
    max: number | null;
  };
}

export interface InvoiceStatusOverview {
  statusBreakdown: InvoiceStatusCount[];
  agingAnalysis: AgingBucket[];
  totalInvoices: number;
  totalValue: number;
}

export interface InvoiceStatusResponse extends BaseAnalyticsResponse {
  overview: InvoiceStatusOverview;
}

// Payment Distribution
export interface PaymentMethod {
  method: string;
  count: number;
  totalValue: number;
  countPercentage: number;
  valuePercentage: number;
}

export interface PaymentVolume {
  rangeLabel: string;
  minAmount: number;
  maxAmount: number | null;
  count: number;
  totalValue: number;
  percentage: number;
}

export interface PaymentDistributionOverview {
  paymentMethods: PaymentMethod[];
  volumeDistribution: PaymentVolume[];
  totalPayments: number;
  totalValue: number;
  averagePayment: number;
}

export interface PaymentDistributionResponse extends BaseAnalyticsResponse {
  overview: PaymentDistributionOverview;
}