import axios from 'axios';
import {
    AnalyticsQuery,
    AnalyticsResponse,
    RevenueMetric,
    TenantPerformance,
    InvoiceStatusOverview,
    PaymentDistribution,
} from '../types/analytics';

const API_BASE_URL = '/api';

export const analyticsService = {
    async getAnalytics(query: AnalyticsQuery = {}): Promise<AnalyticsResponse> {
        const response = await axios.get(`${API_BASE_URL}/analytics`, {
            params: query,
        });
        return response.data;
    },

    async getRevenueMetrics(query: AnalyticsQuery = {}): Promise<RevenueMetric[]> {
        const response = await axios.get(`${API_BASE_URL}/analytics/revenue`, {
            params: query,
        });
        return response.data;
    },

    async getTenantPerformance(query: AnalyticsQuery = {}): Promise<TenantPerformance[]> {
        const response = await axios.get(`${API_BASE_URL}/analytics/tenants`, {
            params: query,
        });
        return response.data;
    },

    async getInvoiceStatusOverview(query: AnalyticsQuery = {}): Promise<InvoiceStatusOverview> {
        const response = await axios.get(`${API_BASE_URL}/analytics/invoice-status`, {
            params: query,
        });
        return response.data;
    },

    async getPaymentDistribution(query: AnalyticsQuery = {}): Promise<PaymentDistribution[]> {
        const response = await axios.get(`${API_BASE_URL}/analytics/payment-distribution`, {
            params: query,
        });
        return response.data;
    },
};