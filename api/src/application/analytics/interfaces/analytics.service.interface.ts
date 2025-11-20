import { AnalyticsSummary, AnalyticsQueryParams } from '../dto/analytics.dto';

export interface AnalyticsServiceInterface {
  getAnalyticsSummary(tenantId: string, params?: AnalyticsQueryParams): Promise<AnalyticsSummary>;
}