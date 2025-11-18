import axios from 'axios';
import {
  AnalyticsOverview,
  RevenueMetrics,
  TenantMetrics,
  InvoiceStatusMetrics,
  PaymentMetrics,
  DateRange,
} from '../types/analytics';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export class AnalyticsService {
  private getAuthHeaders() {
    const token = sessionStorage.getItem('clerk-db-jwt');
    return {
      Authorization: `Bearer ${token}`,
    };
  }

  async getOverview(): Promise<AnalyticsOverview> {
    const response = await axios.get(`${API_BASE_URL}/analytics/overview`, {
      headers: this.getAuthHeaders(),
    });
    return response.data;
  }

  async getRevenueMetrics(dateRange?: DateRange): Promise<RevenueMetrics> {
    const params = new URLSearchParams();
    if (dateRange?.startDate) params.append('startDate', dateRange.startDate);
    if (dateRange?.endDate) params.append('endDate', dateRange.endDate);
    if (dateRange?.groupBy) params.append('groupBy', dateRange.groupBy);

    const response = await axios.get(`${API_BASE_URL}/analytics/revenue`, {
      headers: this.getAuthHeaders(),
      params,
    });
    return response.data;
  }

  async getTenantMetrics(dateRange?: DateRange): Promise<TenantMetrics> {
    const params = new URLSearchParams();
    if (dateRange?.startDate) params.append('startDate', dateRange.startDate);
    if (dateRange?.endDate) params.append('endDate', dateRange.endDate);

    const response = await axios.get(`${API_BASE_URL}/analytics/tenants`, {
      headers: this.getAuthHeaders(),
      params,
    });
    return response.data;
  }

  async getInvoiceStatusMetrics(): Promise<InvoiceStatusMetrics> {
    const response = await axios.get(`${API_BASE_URL}/analytics/invoice-status`, {
      headers: this.getAuthHeaders(),
    });
    return response.data;
  }

  async getPaymentMetrics(dateRange?: DateRange): Promise<PaymentMetrics> {
    const params = new URLSearchParams();
    if (dateRange?.startDate) params.append('startDate', dateRange.startDate);
    if (dateRange?.endDate) params.append('endDate', dateRange.endDate);

    const response = await axios.get(`${API_BASE_URL}/analytics/payments`, {
      headers: this.getAuthHeaders(),
      params,
    });
    return response.data;
  }
}

export const analyticsService = new AnalyticsService();