import axios from 'axios';
import { AnalyticsData, AnalyticsFilters, DrillDownData } from '../types/analytics';

export const analyticsService = {
  /**
   * Get analytics data with optional filters
   * @param filters - Optional filters for the analytics data
   * @returns Promise<AnalyticsData>
   */
  getAnalytics: async (filters?: AnalyticsFilters): Promise<AnalyticsData> => {
    const response = await axios.get<AnalyticsData>('/analytics', {
      params: filters,
    });
    return response.data;
  },

  /**
   * Get drill-down data for specific metrics
   * @param type - The type of drill-down data to fetch
   * @param filters - Filters for the drill-down query
   * @returns Promise<DrillDownData>
   */
  getDrillDownData: async (
    type: 'revenue' | 'tenant' | 'status' | 'payment',
    filters: Record<string, unknown>,
  ): Promise<DrillDownData> => {
    const response = await axios.get<DrillDownData>(`/analytics/drill-down/${type}`, {
      params: filters,
    });
    return response.data;
  },

  /**
   * Export analytics data to CSV
   * @param filters - Optional filters for the export
   * @returns Promise<Blob>
   */
  exportData: async (filters?: AnalyticsFilters): Promise<Blob> => {
    const response = await axios.get('/analytics/export', {
      params: filters,
      responseType: 'blob',
    });
    return response.data;
  },
};