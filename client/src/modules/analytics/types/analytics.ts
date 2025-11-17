export enum DateRangeEnum {
    LAST_30_DAYS = 'last_30_days',
    LAST_90_DAYS = 'last_90_days',
    LAST_6_MONTHS = 'last_6_months',
    LAST_YEAR = 'last_year',
    CUSTOM = 'custom',
}

export interface AnalyticsQuery {
    dateRange?: DateRangeEnum;
    startDate?: string;
    endDate?: string;
    tenantId?: string;
}

export interface RevenueMetric {
    period: string;
    totalRevenue: number;
    invoiceCount: number;
    averageInvoiceValue: number;
}

export interface TenantPerformance {
    tenantId: string;
    tenantName: string;
    totalInvoices: number;
    totalRevenue: number;
    averageInvoiceValue: number;
    paymentScore: number;
}

export interface InvoiceStatusOverview {
    paid: number;
    unpaid: number;
    overdue: number;
    total: number;
}

export interface PaymentDistribution {
    category: string;
    count: number;
    amount: number;
    percentage: number;
}

export interface AnalyticsResponse {
    revenueMetrics: RevenueMetric[];
    tenantPerformance: TenantPerformance[];
    invoiceStatusOverview: InvoiceStatusOverview;
    paymentDistribution: PaymentDistribution[];
    generatedAt: string;
}

export interface ChartData {
    x: string | number;
    y: number;
    label?: string;
    fill?: string;
}

export interface DrillDownData {
    type: 'revenue' | 'tenant' | 'status' | 'payment';
    filters: AnalyticsQuery;
    data: any;
}