import axios from 'axios';
import { AnalyticsSummary, AnalyticsQueryParams } from '../types/analytics';

const API_BASE_URL = '/api';

export const analyticsService = {
  getAnalyticsSummary: async (params?: AnalyticsQueryParams): Promise<AnalyticsSummary> => {
    const queryString = params ? new URLSearchParams(params as any).toString() : '';
    const url = `${API_BASE_URL}/analytics/summary${queryString ? `?${queryString}` : ''}`;
    
    const response = await axios.get(url);
    return response.data;
  },
};