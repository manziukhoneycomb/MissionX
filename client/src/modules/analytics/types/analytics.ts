export interface RevenueMetrics {
  readonly monthlyRevenue: MonthlyRevenueData[];
  readonly quarterlyRevenue: QuarterlyRevenueData[];
  readonly totalRevenue: number;
  readonly revenueGrowth: number;
}

export interface MonthlyRevenueData {
  readonly month: string;
  readonly year: number;
  readonly revenue: number;
  readonly invoiceCount: number;
}

export interface QuarterlyRevenueData {
  readonly quarter: number;
  readonly year: number;
  readonly revenue: number;
  readonly invoiceCount: number;
}

export interface TenantPerformanceMetrics {
  readonly topTenants: TenantMetric[];
  readonly tenantDistribution: TenantDistributionData[];
  readonly averageInvoiceValue: number;
  readonly totalTenants: number;
}

export interface TenantMetric {
  readonly tenantId: string;
  readonly tenantName: string;
  readonly totalRevenue: number;
  readonly invoiceCount: number;
  readonly averageInvoiceValue: number;
  readonly paymentTimeliness: number;
}

export interface TenantDistributionData {
  readonly tenantName: string;
  readonly revenue: number;
  readonly percentage: number;
}

export interface InvoiceStatusMetrics {
  readonly statusOverview: InvoiceStatusData[];
  readonly agingAnalysis: AgingAnalysisData[];
  readonly overallMetrics: OverallInvoiceMetrics;
}

export interface InvoiceStatusData {
  readonly status: string;
  readonly count: number;
  readonly percentage: number;
  readonly totalAmount: number;
}

export interface AgingAnalysisData {
  readonly ageRange: string;
  readonly count: number;
  readonly totalAmount: number;
}

export interface OverallInvoiceMetrics {
  readonly totalInvoices: number;
  readonly paidInvoices: number;
  readonly unpaidInvoices: number;
  readonly overdueInvoices: number;
  readonly averageDaysToPayment: number;
}

export interface PaymentDistributionMetrics {
  readonly paymentMethods: PaymentMethodData[];
  readonly paymentTimeline: PaymentTimelineData[];
  readonly averagePaymentTime: number;
}

export interface PaymentMethodData {
  readonly method: string;
  readonly count: number;
  readonly percentage: number;
  readonly totalAmount: number;
}

export interface PaymentTimelineData {
  readonly date: string;
  readonly paymentsReceived: number;
  readonly totalAmount: number;
}

export interface AnalyticsSummary {
  readonly revenueMetrics: RevenueMetrics;
  readonly tenantPerformanceMetrics: TenantPerformanceMetrics;
  readonly invoiceStatusMetrics: InvoiceStatusMetrics;
  readonly paymentDistributionMetrics: PaymentDistributionMetrics;
}

export interface AnalyticsFilters {
  readonly startDate?: string;
  readonly endDate?: string;
  readonly tenantIds?: string[];
  readonly status?: string[];
}

export interface AnalyticsQueryParams {
  readonly filters?: AnalyticsFilters;
  readonly groupBy?: string;
  readonly sortBy?: string;
  readonly sortOrder?: 'asc' | 'desc';
}