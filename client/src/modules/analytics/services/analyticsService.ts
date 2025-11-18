import axios, { AxiosResponse } from 'axios';
import { AnalyticsData, AnalyticsQueryParams } from '../types/analytics';

export const getAnalytics = async (params?: AnalyticsQueryParams): Promise<AnalyticsData> => {
  const response: AxiosResponse<AnalyticsData> = await axios.get('/analytics', { params });
  return response.data;
};