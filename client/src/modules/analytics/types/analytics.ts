export interface RevenueMetric {
  period: string; // YYYY-MM or YYYY-MM-DD
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

export interface InvoiceStatusMetric {
  status: 'paid' | 'unpaid' | 'overdue';
  count: number;
  totalAmount: number;
}

export interface PaymentMethodMetric {
  method: string;
  count: number;
  totalAmount: number;
  percentage: number;
}

export interface AgingAnalysis {
  range: string; // e.g., "0-30 days", "31-60 days", etc.
  count: number;
  totalAmount: number;
}

export interface AnalyticsData {
  revenueMetrics: RevenueMetric[];
  tenantMetrics: TenantMetric[];
  invoiceStatusMetrics: InvoiceStatusMetric[];
  paymentMethodMetrics: PaymentMethodMetric[];
  agingAnalysis: AgingAnalysis[];
  totalRevenue: number;
  totalInvoices: number;
  averageInvoiceValue: number;
}

export interface AnalyticsFilters {
  startDate?: string;
  endDate?: string;
  tenantIds?: string[];
  groupBy?: 'day' | 'month' | 'quarter';
}

export interface DrillDownData {
  type: 'revenue' | 'tenant' | 'status' | 'payment';
  period?: string;
  tenantId?: string;
  status?: string;
  paymentMethod?: string;
  invoices: Array<{
    id: string;
    invoiceNumber: string;
    customerName: string;
    totalAmount: number;
    issueDate: string;
    dueDate: string;
  }>;
}