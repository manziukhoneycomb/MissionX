import { analyticsService } from './services/analyticsService';
import { AnalyticsQueryParams } from './types/analytics';

export const getAnalyticsSummary = async (params?: AnalyticsQueryParams) => {
  return analyticsService.getAnalyticsSummary(params);
};