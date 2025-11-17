export interface RevenueTrendDto {
  date: string;
  revenue: number;
  invoiceCount: number;
  period: string;
}

export interface RevenueMetricsDto {
  totalRevenue: number;
  averageInvoiceValue: number;
  growthPercentage: number;
  trends: RevenueTrendDto[];
}

export interface TenantMetricsDto {
  tenantId: string;
  tenantName: string;
  invoiceCount: number;
  totalRevenue: number;
  averageInvoiceValue: number;
  paymentTimeliness: number;
  overdueCount: number;
}

export interface TopTenantsDto {
  topByRevenue: TenantMetricsDto[];
  topByInvoiceCount: TenantMetricsDto[];
  bestPaymentTimeliness: TenantMetricsDto[];
}

export interface InvoiceStatusBreakdownDto {
  status: string;
  count: number;
  totalAmount: number;
  percentage: number;
}

export interface AgingAnalysisDto {
  ageRange: string;
  count: number;
  totalAmount: number;
  averageDaysOverdue: number;
}

export interface InvoiceStatusDto {
  totalInvoices: number;
  paidCount: number;
  unpaidCount: number;
  overdueCount: number;
  statusBreakdown: InvoiceStatusBreakdownDto[];
  agingAnalysis: AgingAnalysisDto[];
}

export interface PaymentMethodDto {
  method: string;
  count: number;
  totalAmount: number;
  percentage: number;
}

export interface PaymentVolumeDto {
  date: string;
  paymentCount: number;
  totalAmount: number;
}

export interface PaymentDistributionDto {
  totalPayments: number;
  totalAmount: number;
  averagePaymentAmount: number;
  byPaymentMethod: PaymentMethodDto[];
  paymentVolume: PaymentVolumeDto[];
}

export interface AnalyticsResponseDto {
  revenueTrends: RevenueTrendDto[];
  tenantMetrics: TenantMetricsDto[];
  invoiceStatus: InvoiceStatusDto;
  paymentDistribution: PaymentDistributionDto;
  dateRange: {
    startDate: string;
    endDate: string;
  };
}

export interface AnalyticsQueryDto {
  startDate?: string;
  endDate?: string;
  period?: 'daily' | 'weekly' | 'monthly' | 'quarterly';
  limit?: number;
}