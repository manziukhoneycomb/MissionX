import { AnalyticsData, AnalyticsQueryParams } from '../dto/analytics.dto';

export interface IAnalyticsService {
  getAnalyticsData(params?: AnalyticsQueryParams): Promise<AnalyticsData>;
}