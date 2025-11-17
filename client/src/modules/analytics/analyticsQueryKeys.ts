export const analyticsQueryKeys = {
  all: ['analytics'] as const,
  data: (startDate?: string, endDate?: string) =>
    [...analyticsQueryKeys.all, 'data', { startDate, endDate }] as const,
  revenue: (period: string, startDate?: string, endDate?: string) =>
    [...analyticsQueryKeys.all, 'revenue', { period, startDate, endDate }] as const,
  tenants: (sortBy: string, order: string) =>
    [...analyticsQueryKeys.all, 'tenants', { sortBy, order }] as const,
  invoiceStatus: () =>
    [...analyticsQueryKeys.all, 'status'] as const,
  paymentDistribution: (period?: string) =>
    [...analyticsQueryKeys.all, 'payments', { period }] as const,
};