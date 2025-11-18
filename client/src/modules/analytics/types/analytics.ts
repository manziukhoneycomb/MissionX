export interface DateRange {
  startDate?: string;
  endDate?: string;
  groupBy?: 'day' | 'week' | 'month' | 'quarter';
}

export interface MetricSummary {
  current: number;
  previous: number;
  changePercent: number;
  changeType: 'increase' | 'decrease' | 'no-change';
}

export interface AnalyticsOverview {
  totalRevenue: MetricSummary;
  totalInvoices: MetricSummary;
  avgInvoiceValue: MetricSummary;
  paymentSuccessRate: MetricSummary;
}

export interface TimeSeriesDataPoint {
  date: string;
  value: number;
  metadata?: Record<string, unknown>;
}

export interface TopCustomer {
  customerName: string;
  revenue: number;
  invoiceCount: number;
}

export interface PaymentDistribution {
  method: string;
  amount: number;
  percentage: number;
  count: number;
}

export interface PeriodComparison {
  period: string;
  revenue: number;
  invoiceCount: number;
  avgValue: number;
}

export interface RevenueMetrics {
  trends: TimeSeriesDataPoint[];
  topCustomers: TopCustomer[];
  paymentDistribution: PaymentDistribution[];
  periodComparison: PeriodComparison[];
}

export interface TenantPerformance {
  tenantName: string;
  invoiceCount: number;
  totalRevenue: number;
  avgInvoiceValue: number;
}

export interface PaymentTimeliness {
  tenantName: string;
  onTimePayments: number;
  latePayments: number;
  avgDaysToPayment: number;
  timelinessRate: number;
}

export interface TenantMetrics {
  invoicesPerTenant: TenantPerformance[];
  paymentTimeliness: PaymentTimeliness[];
  performanceTrends: TimeSeriesDataPoint[];
}

export interface InvoiceStatus {
  status: 'paid' | 'unpaid' | 'overdue' | 'draft';
  count: number;
  percentage: number;
  totalAmount: number;
}

export interface InvoiceAging {
  ageRange: string;
  count: number;
  totalAmount: number;
  percentage: number;
}

export interface InvoiceStatusMetrics {
  statusDistribution: InvoiceStatus[];
  agingAnalysis: InvoiceAging[];
  statusTrends: TimeSeriesDataPoint[];
}

export interface PaymentMethodDistribution {
  method: string;
  count: number;
  amount: number;
  percentage: number;
}

export interface PaymentTimelinessData {
  onTime: number;
  late: number;
  avgDaysEarly: number;
  avgDaysLate: number;
  timelinessRate: number;
}

export interface CollectionEfficiency {
  totalOutstanding: number;
  totalCollected: number;
  collectionRate: number;
  avgCollectionTime: number;
}

export interface PaymentMetrics {
  methodDistribution: PaymentMethodDistribution[];
  timeliness: PaymentTimelinessData;
  paymentTrends: TimeSeriesDataPoint[];
  collectionEfficiency: CollectionEfficiency;
}

export interface ChartData {
  x: string | number;
  y: number;
  label?: string;
  [key: string]: unknown;
}