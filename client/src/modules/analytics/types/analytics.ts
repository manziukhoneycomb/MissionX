export interface AnalyticsQueryParams {
  startDate?: string;
  endDate?: string;
  tenantId?: string;
}

export interface RevenueTrend {
  period: string;
  revenue: number;
  invoiceCount: number;
  averageValue: number;
}

export interface MonthlyRevenue {
  month: string;
  revenue: number;
  invoiceCount: number;
}

export interface QuarterlyRevenue {
  quarter: string;
  revenue: number;
  invoiceCount: number;
}

export interface TenantMetrics {
  tenantId: string;
  tenantName: string;
  invoiceCount: number;
  totalRevenue: number;
  averageInvoiceValue: number;
  overdueCount: number;
  averagePaymentDays?: number;
}

export interface TopCustomer {
  customerName: string;
  totalRevenue: number;
  invoiceCount: number;
  averageInvoiceValue: number;
}

export interface InvoiceStatus {
  paidCount: number;
  unpaidCount: number;
  overdueCount: number;
  paidAmount: number;
  unpaidAmount: number;
  overdueAmount: number;
}

export interface InvoiceAging {
  ageRange: string;
  count: number;
  totalValue: number;
  percentage: number;
}

export interface PaymentTiming {
  category: 'Early' | 'On Time' | 'Late' | 'Very Late';
  count: number;
  totalValue: number;
  percentage: number;
}

export interface AmountRange {
  range: string;
  count: number;
  totalValue: number;
  percentage: number;
}

export interface CustomerDistribution {
  customerName: string;
  invoiceCount: number;
  totalValue: number;
  percentage: number;
}

export interface VendorDistribution {
  vendorName: string;
  invoiceCount: number;
  totalValue: number;
  percentage: number;
}

export interface PaymentDistribution {
  byTiming: PaymentTiming[];
  byAmountRange: AmountRange[];
  byCustomer: CustomerDistribution[];
  byVendor: VendorDistribution[];
}

export interface AnalyticsResponse {
  revenueTrends: RevenueTrend[];
  tenantMetrics: TenantMetrics[];
  invoiceStatus: InvoiceStatus;
  paymentDistribution: PaymentDistribution;
}

export interface ChartDateRange {
  startDate?: Date;
  endDate?: Date;
}

export interface ChartFilters {
  dateRange: ChartDateRange;
  selectedTenantId?: string;
}