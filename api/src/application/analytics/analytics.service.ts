import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Invoice } from '../../domain/entities/invoice.entity';
import { Tenant } from '../../domain/entities/tenant.entity';
import {
  AnalyticsData,
  AnalyticsQueryParams,
  RevenueMetrics,
  TopCustomer,
  PaymentDistribution,
  TenantPerformance,
  InvoiceStatusOverview,
  AgingAnalysis,
} from './dto/analytics.dto';
import { IAnalyticsService } from './interfaces/analytics.service.interface';

@Injectable()
export class AnalyticsService implements IAnalyticsService {
  constructor(
    @InjectRepository(Invoice)
    private readonly invoiceRepository: Repository<Invoice>,
    @InjectRepository(Tenant)
    private readonly tenantRepository: Repository<Tenant>
  ) {}

  async getAnalyticsData(params?: AnalyticsQueryParams): Promise<AnalyticsData> {
    const dateRange = this.getDateRange(params);
    
    const [
      revenueMetrics,
      topCustomers,
      paymentDistribution,
      tenantPerformance,
      invoiceStatusOverview,
      agingAnalysis,
    ] = await Promise.all([
      this.getRevenueMetrics(dateRange, params?.tenantId),
      this.getTopCustomers(dateRange, params?.tenantId),
      this.getPaymentDistribution(dateRange, params?.tenantId),
      this.getTenantPerformance(dateRange, params?.tenantId),
      this.getInvoiceStatusOverview(dateRange, params?.tenantId),
      this.getAgingAnalysis(params?.tenantId),
    ]);

    return {
      revenueMetrics,
      topCustomers,
      paymentDistribution,
      tenantPerformance,
      invoiceStatusOverview,
      agingAnalysis,
      dateRange,
    };
  }

  private getDateRange(params?: AnalyticsQueryParams): { startDate: string; endDate: string } {
    const endDate = params?.endDate || new Date().toISOString().split('T')[0];
    const startDate = params?.startDate || new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    return { startDate, endDate };
  }

  private async getRevenueMetrics(dateRange: { startDate: string; endDate: string }, tenantId?: string): Promise<RevenueMetrics> {
    const whereCondition = this.buildWhereCondition(dateRange, tenantId);
    
    // Get total revenue
    const totalRevenueResult = await this.invoiceRepository
      .createQueryBuilder('invoice')
      .select('SUM(invoice.totalAmount)', 'total')
      .where(whereCondition.condition, whereCondition.parameters)
      .getRawOne();

    // Get monthly revenue
    const monthlyRevenueResult = await this.invoiceRepository
      .createQueryBuilder('invoice')
      .select([
        "TO_CHAR(invoice.issueDate::date, 'YYYY-MM') as month",
        'SUM(invoice.totalAmount) as revenue'
      ])
      .where(whereCondition.condition, whereCondition.parameters)
      .groupBy("TO_CHAR(invoice.issueDate::date, 'YYYY-MM')")
      .orderBy('month', 'ASC')
      .getRawMany();

    // Get quarterly revenue
    const quarterlyRevenueResult = await this.invoiceRepository
      .createQueryBuilder('invoice')
      .select([
        "CONCAT(EXTRACT(YEAR FROM invoice.issueDate::date), '-Q', EXTRACT(QUARTER FROM invoice.issueDate::date)) as quarter",
        'SUM(invoice.totalAmount) as revenue'
      ])
      .where(whereCondition.condition, whereCondition.parameters)
      .groupBy("CONCAT(EXTRACT(YEAR FROM invoice.issueDate::date), '-Q', EXTRACT(QUARTER FROM invoice.issueDate::date))")
      .orderBy('quarter', 'ASC')
      .getRawMany();

    return {
      totalRevenue: parseFloat(totalRevenueResult?.total || '0'),
      monthlyRevenue: monthlyRevenueResult.map(row => ({
        month: row.month,
        revenue: parseFloat(row.revenue)
      })),
      quarterlyRevenue: quarterlyRevenueResult.map(row => ({
        quarter: row.quarter,
        revenue: parseFloat(row.revenue)
      }))
    };
  }

  private async getTopCustomers(dateRange: { startDate: string; endDate: string }, tenantId?: string): Promise<TopCustomer[]> {
    const whereCondition = this.buildWhereCondition(dateRange, tenantId);
    
    const result = await this.invoiceRepository
      .createQueryBuilder('invoice')
      .select([
        'invoice.customerName as customerName',
        'SUM(invoice.totalAmount) as totalRevenue',
        'COUNT(*) as invoiceCount'
      ])
      .where(whereCondition.condition, whereCondition.parameters)
      .groupBy('invoice.customerName')
      .orderBy('totalRevenue', 'DESC')
      .limit(10)
      .getRawMany();

    return result.map(row => ({
      customerName: row.customername,
      totalRevenue: parseFloat(row.totalrevenue),
      invoiceCount: parseInt(row.invoicecount)
    }));
  }

  private async getPaymentDistribution(dateRange: { startDate: string; endDate: string }, tenantId?: string): Promise<PaymentDistribution> {
    const whereCondition = this.buildWhereCondition(dateRange, tenantId);
    const today = new Date().toISOString().split('T')[0];

    // For now, we'll simulate payment status based on due date since we don't have a payment status field
    const result = await this.invoiceRepository
      .createQueryBuilder('invoice')
      .select([
        `COUNT(CASE WHEN invoice.dueDate::date >= '${today}' THEN 1 END) as unpaid`,
        `COUNT(CASE WHEN invoice.dueDate::date < '${today}' THEN 1 END) as overdue`,
        'COUNT(*) as total'
      ])
      .where(whereCondition.condition, whereCondition.parameters)
      .getRawOne();

    const total = parseInt(result?.total || '0');
    const overdue = parseInt(result?.overdue || '0');
    const unpaid = parseInt(result?.unpaid || '0');
    const paid = Math.max(0, total - unpaid - overdue);

    return {
      paid,
      unpaid,
      overdue
    };
  }

  private async getTenantPerformance(dateRange: { startDate: string; endDate: string }, tenantId?: string): Promise<TenantPerformance[]> {
    const baseQuery = this.invoiceRepository
      .createQueryBuilder('invoice')
      .leftJoin('invoice.tenant', 'tenant')
      .select([
        'tenant.id as tenantId',
        'tenant.name as tenantName',
        'COUNT(invoice.id) as invoiceCount',
        'SUM(invoice.totalAmount) as totalRevenue',
        'AVG(invoice.totalAmount) as averageInvoiceValue'
      ])
      .where('invoice.issueDate::date >= :startDate AND invoice.issueDate::date <= :endDate', {
        startDate: dateRange.startDate,
        endDate: dateRange.endDate
      });

    if (tenantId) {
      baseQuery.andWhere('tenant.id = :tenantId', { tenantId });
    }

    const result = await baseQuery
      .groupBy('tenant.id, tenant.name')
      .orderBy('totalRevenue', 'DESC')
      .getRawMany();

    return result.map(row => ({
      tenantId: row.tenantid,
      tenantName: row.tenantname || 'Unknown',
      invoiceCount: parseInt(row.invoicecount),
      totalRevenue: parseFloat(row.totalrevenue || '0'),
      averageInvoiceValue: parseFloat(row.averageinvoicevalue || '0'),
      averagePaymentTime: 0 // Placeholder since we don't have payment data
    }));
  }

  private async getInvoiceStatusOverview(dateRange: { startDate: string; endDate: string }, tenantId?: string): Promise<InvoiceStatusOverview> {
    const whereCondition = this.buildWhereCondition(dateRange, tenantId);
    const today = new Date().toISOString().split('T')[0];

    const result = await this.invoiceRepository
      .createQueryBuilder('invoice')
      .select([
        'COUNT(*) as total',
        `COUNT(CASE WHEN invoice.dueDate::date < '${today}' THEN 1 END) as overdue`,
        `COUNT(CASE WHEN invoice.dueDate::date >= '${today}' THEN 1 END) as unpaid`
      ])
      .where(whereCondition.condition, whereCondition.parameters)
      .getRawOne();

    const total = parseInt(result?.total || '0');
    const overdue = parseInt(result?.overdue || '0');
    const unpaid = parseInt(result?.unpaid || '0');
    const paid = Math.max(0, total - unpaid - overdue);

    const paidPercentage = total > 0 ? (paid / total) * 100 : 0;
    const unpaidPercentage = total > 0 ? (unpaid / total) * 100 : 0;
    const overduePercentage = total > 0 ? (overdue / total) * 100 : 0;

    return {
      total,
      paid,
      unpaid,
      overdue,
      paidPercentage: Math.round(paidPercentage * 100) / 100,
      unpaidPercentage: Math.round(unpaidPercentage * 100) / 100,
      overduePercentage: Math.round(overduePercentage * 100) / 100
    };
  }

  private async getAgingAnalysis(tenantId?: string): Promise<AgingAnalysis> {
    const today = new Date();
    const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const sixtyDaysAgo = new Date(today.getTime() - 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const ninetyDaysAgo = new Date(today.getTime() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const todayStr = today.toISOString().split('T')[0];

    let query = this.invoiceRepository
      .createQueryBuilder('invoice')
      .select([
        `COUNT(CASE WHEN invoice.dueDate::date >= '${todayStr}' THEN 1 END) as current`,
        `COUNT(CASE WHEN invoice.dueDate::date < '${todayStr}' AND invoice.dueDate::date >= '${thirtyDaysAgo}' THEN 1 END) as days1to30`,
        `COUNT(CASE WHEN invoice.dueDate::date < '${thirtyDaysAgo}' AND invoice.dueDate::date >= '${sixtyDaysAgo}' THEN 1 END) as days31to60`,
        `COUNT(CASE WHEN invoice.dueDate::date < '${sixtyDaysAgo}' AND invoice.dueDate::date >= '${ninetyDaysAgo}' THEN 1 END) as days61to90`,
        `COUNT(CASE WHEN invoice.dueDate::date < '${ninetyDaysAgo}' THEN 1 END) as over90Days`
      ]);

    if (tenantId) {
      query = query.where('invoice.tenantId = :tenantId', { tenantId });
    }

    const result = await query.getRawOne();

    return {
      current: parseInt(result?.current || '0'),
      days1to30: parseInt(result?.days1to30 || '0'),
      days31to60: parseInt(result?.days31to60 || '0'),
      days61to90: parseInt(result?.days61to90 || '0'),
      over90Days: parseInt(result?.over90days || '0')
    };
  }

  private buildWhereCondition(dateRange: { startDate: string; endDate: string }, tenantId?: string) {
    let condition = 'invoice.issueDate::date >= :startDate AND invoice.issueDate::date <= :endDate';
    const parameters: any = {
      startDate: dateRange.startDate,
      endDate: dateRange.endDate
    };

    if (tenantId) {
      condition += ' AND invoice.tenantId = :tenantId';
      parameters.tenantId = tenantId;
    }

    return { condition, parameters };
  }
}