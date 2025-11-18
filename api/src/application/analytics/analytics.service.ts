import { Injectable, Inject } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Invoice } from '../../domain/entities/invoice.entity';
import { Tenant } from '../../domain/entities/tenant.entity';
import { IAnalyticsService } from './interfaces/analytics.service.interface';
import {
    AnalyticsOverviewDto,
    RevenueMetricsDto,
    TenantMetricsDto,
    InvoiceStatusMetricsDto,
    PaymentMetricsDto,
    DateRangeDto,
    MetricSummaryDto,
    TimeSeriesDataPointDto,
} from './dto/analytics.dto';

@Injectable()
export class AnalyticsService implements IAnalyticsService {
    constructor(
        @InjectRepository(Invoice)
        private readonly invoiceRepository: Repository<Invoice>,
        @InjectRepository(Tenant)
        private readonly tenantRepository: Repository<Tenant>,
    ) {}

    async getOverview(tenantId: string): Promise<AnalyticsOverviewDto> {
        const currentDate = new Date();
        const currentMonthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        const previousMonthStart = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
        const previousMonthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0);

        // Current month metrics
        const currentMetrics = await this.getMetricsForPeriod(tenantId, currentMonthStart, currentDate);
        
        // Previous month metrics
        const previousMetrics = await this.getMetricsForPeriod(tenantId, previousMonthStart, previousMonthEnd);

        return {
            totalRevenue: this.calculateMetricSummary(currentMetrics.totalRevenue, previousMetrics.totalRevenue),
            totalInvoices: this.calculateMetricSummary(currentMetrics.totalInvoices, previousMetrics.totalInvoices),
            avgInvoiceValue: this.calculateMetricSummary(currentMetrics.avgInvoiceValue, previousMetrics.avgInvoiceValue),
            paymentSuccessRate: this.calculateMetricSummary(currentMetrics.paymentSuccessRate, previousMetrics.paymentSuccessRate),
        };
    }

    async getRevenueMetrics(tenantId: string, dateRange: DateRangeDto): Promise<RevenueMetricsDto> {
        const { startDate, endDate, groupBy = 'month' } = dateRange;
        const queryBuilder = this.invoiceRepository.createQueryBuilder('invoice');

        queryBuilder.where('invoice.tenantId = :tenantId', { tenantId });

        if (startDate) {
            queryBuilder.andWhere('invoice.issueDate >= :startDate', { startDate });
        }
        if (endDate) {
            queryBuilder.andWhere('invoice.issueDate <= :endDate', { endDate });
        }

        // Get trends data
        const trends = await this.getRevenueTrends(tenantId, dateRange);
        
        // Get top customers
        const topCustomers = await this.getTopCustomers(tenantId, dateRange);
        
        // Get payment distribution (simulated as we don't have payment method data)
        const paymentDistribution = await this.getPaymentDistribution(tenantId, dateRange);
        
        // Get period comparison
        const periodComparison = await this.getPeriodComparison(tenantId, dateRange);

        return {
            trends,
            topCustomers,
            paymentDistribution,
            periodComparison,
        };
    }

    async getTenantMetrics(tenantId: string, dateRange: DateRangeDto): Promise<TenantMetricsDto> {
        const { startDate, endDate } = dateRange;

        // For single tenant context, we'll show customer-based metrics instead
        const queryBuilder = this.invoiceRepository.createQueryBuilder('invoice');
        queryBuilder.where('invoice.tenantId = :tenantId', { tenantId });

        if (startDate) {
            queryBuilder.andWhere('invoice.issueDate >= :startDate', { startDate });
        }
        if (endDate) {
            queryBuilder.andWhere('invoice.issueDate <= :endDate', { endDate });
        }

        const invoices = await queryBuilder.getMany();

        // Group by customer name (acting as tenant equivalent)
        const customerMetrics = this.groupInvoicesByCustomer(invoices);
        
        return {
            invoicesPerTenant: customerMetrics.invoicesPerCustomer,
            paymentTimeliness: customerMetrics.paymentTimeliness,
            performanceTrends: await this.getCustomerPerformanceTrends(tenantId, dateRange),
        };
    }

    async getInvoiceStatusMetrics(tenantId: string): Promise<InvoiceStatusMetricsDto> {
        const invoices = await this.invoiceRepository.find({ where: { tenantId } });
        const currentDate = new Date();

        // Calculate status distribution based on due dates
        const statusDistribution = this.calculateInvoiceStatusDistribution(invoices, currentDate);
        
        // Calculate aging analysis
        const agingAnalysis = this.calculateInvoiceAging(invoices, currentDate);
        
        // Get status trends (last 12 months)
        const statusTrends = await this.getInvoiceStatusTrends(tenantId);

        return {
            statusDistribution,
            agingAnalysis,
            statusTrends,
        };
    }

    async getPaymentMetrics(tenantId: string, dateRange: DateRangeDto): Promise<PaymentMetricsDto> {
        const { startDate, endDate } = dateRange;
        const queryBuilder = this.invoiceRepository.createQueryBuilder('invoice');
        
        queryBuilder.where('invoice.tenantId = :tenantId', { tenantId });

        if (startDate) {
            queryBuilder.andWhere('invoice.issueDate >= :startDate', { startDate });
        }
        if (endDate) {
            queryBuilder.andWhere('invoice.issueDate <= :endDate', { endDate });
        }

        const invoices = await queryBuilder.getMany();
        
        return {
            methodDistribution: this.getPaymentMethodDistribution(invoices),
            timeliness: this.calculatePaymentTimeliness(invoices),
            paymentTrends: await this.getPaymentTrends(tenantId, dateRange),
            collectionEfficiency: this.calculateCollectionEfficiency(invoices),
        };
    }

    private async getMetricsForPeriod(tenantId: string, startDate: Date, endDate: Date) {
        const invoices = await this.invoiceRepository
            .createQueryBuilder('invoice')
            .where('invoice.tenantId = :tenantId', { tenantId })
            .andWhere('invoice.issueDate >= :startDate', { startDate: startDate.toISOString().split('T')[0] })
            .andWhere('invoice.issueDate <= :endDate', { endDate: endDate.toISOString().split('T')[0] })
            .getMany();

        const totalRevenue = invoices.reduce((sum, invoice) => sum + Number(invoice.totalAmount), 0);
        const totalInvoices = invoices.length;
        const avgInvoiceValue = totalInvoices > 0 ? totalRevenue / totalInvoices : 0;
        
        // Simulate payment success rate based on due date vs current date
        const currentDate = new Date();
        const paidInvoices = invoices.filter(invoice => new Date(invoice.dueDate) <= currentDate);
        const paymentSuccessRate = totalInvoices > 0 ? (paidInvoices.length / totalInvoices) * 100 : 0;

        return {
            totalRevenue,
            totalInvoices,
            avgInvoiceValue,
            paymentSuccessRate,
        };
    }

    private calculateMetricSummary(current: number, previous: number): MetricSummaryDto {
        const changePercent = previous !== 0 ? ((current - previous) / previous) * 100 : 0;
        const changeType = current > previous ? 'increase' : current < previous ? 'decrease' : 'no-change';

        return {
            current,
            previous,
            changePercent: Math.round(changePercent * 100) / 100,
            changeType,
        };
    }

    private async getRevenueTrends(tenantId: string, dateRange: DateRangeDto): Promise<TimeSeriesDataPointDto[]> {
        const { groupBy = 'month' } = dateRange;
        const dateFormat = groupBy === 'month' ? '%Y-%m' : '%Y-%m-%d';
        
        const query = this.invoiceRepository
            .createQueryBuilder('invoice')
            .select([
                `DATE_FORMAT(invoice.issueDate, '${dateFormat}') as date`,
                'SUM(invoice.totalAmount) as value'
            ])
            .where('invoice.tenantId = :tenantId', { tenantId })
            .groupBy('date')
            .orderBy('date', 'ASC');

        if (dateRange.startDate) {
            query.andWhere('invoice.issueDate >= :startDate', { startDate: dateRange.startDate });
        }
        if (dateRange.endDate) {
            query.andWhere('invoice.issueDate <= :endDate', { endDate: dateRange.endDate });
        }

        const results = await query.getRawMany();
        
        return results.map(row => ({
            date: row.date,
            value: Number(row.value),
        }));
    }

    private async getTopCustomers(tenantId: string, dateRange: DateRangeDto) {
        const query = this.invoiceRepository
            .createQueryBuilder('invoice')
            .select([
                'invoice.customerName as customerName',
                'SUM(invoice.totalAmount) as revenue',
                'COUNT(*) as invoiceCount'
            ])
            .where('invoice.tenantId = :tenantId', { tenantId })
            .groupBy('invoice.customerName')
            .orderBy('revenue', 'DESC')
            .limit(10);

        if (dateRange.startDate) {
            query.andWhere('invoice.issueDate >= :startDate', { startDate: dateRange.startDate });
        }
        if (dateRange.endDate) {
            query.andWhere('invoice.issueDate <= :endDate', { endDate: dateRange.endDate });
        }

        const results = await query.getRawMany();
        
        return results.map(row => ({
            customerName: row.customerName,
            revenue: Number(row.revenue),
            invoiceCount: Number(row.invoiceCount),
        }));
    }

    private async getPaymentDistribution(tenantId: string, dateRange: DateRangeDto) {
        // Simulate payment method distribution since we don't have actual payment data
        const totalQuery = this.invoiceRepository
            .createQueryBuilder('invoice')
            .select('SUM(invoice.totalAmount)', 'total')
            .addSelect('COUNT(*)', 'count')
            .where('invoice.tenantId = :tenantId', { tenantId });

        if (dateRange.startDate) {
            totalQuery.andWhere('invoice.issueDate >= :startDate', { startDate: dateRange.startDate });
        }
        if (dateRange.endDate) {
            totalQuery.andWhere('invoice.issueDate <= :endDate', { endDate: dateRange.endDate });
        }

        const result = await totalQuery.getRawOne();
        const totalAmount = Number(result.total) || 0;
        const totalCount = Number(result.count) || 0;

        // Simulate distribution
        return [
            { method: 'Bank Transfer', amount: totalAmount * 0.6, percentage: 60, count: Math.floor(totalCount * 0.6) },
            { method: 'Credit Card', amount: totalAmount * 0.25, percentage: 25, count: Math.floor(totalCount * 0.25) },
            { method: 'Check', amount: totalAmount * 0.10, percentage: 10, count: Math.floor(totalCount * 0.10) },
            { method: 'Cash', amount: totalAmount * 0.05, percentage: 5, count: Math.floor(totalCount * 0.05) },
        ];
    }

    private async getPeriodComparison(tenantId: string, dateRange: DateRangeDto) {
        const query = this.invoiceRepository
            .createQueryBuilder('invoice')
            .select([
                `DATE_FORMAT(invoice.issueDate, '%Y-%m') as period`,
                'SUM(invoice.totalAmount) as revenue',
                'COUNT(*) as invoiceCount',
                'AVG(invoice.totalAmount) as avgValue'
            ])
            .where('invoice.tenantId = :tenantId', { tenantId })
            .groupBy('period')
            .orderBy('period', 'DESC')
            .limit(12);

        if (dateRange.startDate) {
            query.andWhere('invoice.issueDate >= :startDate', { startDate: dateRange.startDate });
        }
        if (dateRange.endDate) {
            query.andWhere('invoice.issueDate <= :endDate', { endDate: dateRange.endDate });
        }

        const results = await query.getRawMany();
        
        return results.map(row => ({
            period: row.period,
            revenue: Number(row.revenue),
            invoiceCount: Number(row.invoiceCount),
            avgValue: Number(row.avgValue),
        }));
    }

    private groupInvoicesByCustomer(invoices: Invoice[]) {
        const customerGroups = invoices.reduce((acc, invoice) => {
            const customer = invoice.customerName;
            if (!acc[customer]) {
                acc[customer] = [];
            }
            acc[customer].push(invoice);
            return acc;
        }, {} as Record<string, Invoice[]>);

        const invoicesPerCustomer = Object.entries(customerGroups).map(([customerName, customerInvoices]) => ({
            tenantName: customerName,
            invoiceCount: customerInvoices.length,
            totalRevenue: customerInvoices.reduce((sum, inv) => sum + Number(inv.totalAmount), 0),
            avgInvoiceValue: customerInvoices.reduce((sum, inv) => sum + Number(inv.totalAmount), 0) / customerInvoices.length,
        }));

        const paymentTimeliness = Object.entries(customerGroups).map(([customerName, customerInvoices]) => {
            const currentDate = new Date();
            const onTimePayments = customerInvoices.filter(inv => new Date(inv.dueDate) >= currentDate).length;
            const latePayments = customerInvoices.length - onTimePayments;
            const avgDaysToPayment = customerInvoices.reduce((sum, inv) => {
                const daysDiff = Math.floor((currentDate.getTime() - new Date(inv.issueDate).getTime()) / (1000 * 3600 * 24));
                return sum + daysDiff;
            }, 0) / customerInvoices.length;
            
            return {
                tenantName: customerName,
                onTimePayments,
                latePayments,
                avgDaysToPayment: Math.round(avgDaysToPayment),
                timelinessRate: customerInvoices.length > 0 ? (onTimePayments / customerInvoices.length) * 100 : 0,
            };
        });

        return { invoicesPerCustomer, paymentTimeliness };
    }

    private async getCustomerPerformanceTrends(tenantId: string, dateRange: DateRangeDto): Promise<TimeSeriesDataPointDto[]> {
        const query = this.invoiceRepository
            .createQueryBuilder('invoice')
            .select([
                `DATE_FORMAT(invoice.issueDate, '%Y-%m') as date`,
                'COUNT(DISTINCT invoice.customerName) as value'
            ])
            .where('invoice.tenantId = :tenantId', { tenantId })
            .groupBy('date')
            .orderBy('date', 'ASC');

        if (dateRange.startDate) {
            query.andWhere('invoice.issueDate >= :startDate', { startDate: dateRange.startDate });
        }
        if (dateRange.endDate) {
            query.andWhere('invoice.issueDate <= :endDate', { endDate: dateRange.endDate });
        }

        const results = await query.getRawMany();
        
        return results.map(row => ({
            date: row.date,
            value: Number(row.value),
        }));
    }

    private calculateInvoiceStatusDistribution(invoices: Invoice[], currentDate: Date) {
        const statusCounts = {
            paid: 0,
            unpaid: 0,
            overdue: 0,
            draft: 0,
        };

        const statusAmounts = {
            paid: 0,
            unpaid: 0,
            overdue: 0,
            draft: 0,
        };

        invoices.forEach(invoice => {
            const dueDate = new Date(invoice.dueDate);
            const amount = Number(invoice.totalAmount);
            
            if (dueDate < currentDate) {
                statusCounts.overdue++;
                statusAmounts.overdue += amount;
            } else if (dueDate <= currentDate) {
                statusCounts.paid++;
                statusAmounts.paid += amount;
            } else {
                statusCounts.unpaid++;
                statusAmounts.unpaid += amount;
            }
        });

        const total = invoices.length;
        
        return Object.entries(statusCounts).map(([status, count]) => ({
            status: status as 'paid' | 'unpaid' | 'overdue' | 'draft',
            count,
            percentage: total > 0 ? Math.round((count / total) * 100) : 0,
            totalAmount: statusAmounts[status as keyof typeof statusAmounts],
        }));
    }

    private calculateInvoiceAging(invoices: Invoice[], currentDate: Date) {
        const ageRanges = [
            { label: '0-30 days', min: 0, max: 30 },
            { label: '31-60 days', min: 31, max: 60 },
            { label: '61-90 days', min: 61, max: 90 },
            { label: '90+ days', min: 91, max: Infinity },
        ];

        return ageRanges.map(range => {
            const invoicesInRange = invoices.filter(invoice => {
                const daysPastDue = Math.floor((currentDate.getTime() - new Date(invoice.dueDate).getTime()) / (1000 * 3600 * 24));
                return daysPastDue >= range.min && daysPastDue <= range.max;
            });

            const totalAmount = invoicesInRange.reduce((sum, inv) => sum + Number(inv.totalAmount), 0);
            
            return {
                ageRange: range.label,
                count: invoicesInRange.length,
                totalAmount,
                percentage: invoices.length > 0 ? Math.round((invoicesInRange.length / invoices.length) * 100) : 0,
            };
        });
    }

    private async getInvoiceStatusTrends(tenantId: string): Promise<TimeSeriesDataPointDto[]> {
        const query = this.invoiceRepository
            .createQueryBuilder('invoice')
            .select([
                `DATE_FORMAT(invoice.issueDate, '%Y-%m') as date`,
                'COUNT(*) as value'
            ])
            .where('invoice.tenantId = :tenantId', { tenantId })
            .andWhere('invoice.issueDate >= DATE_SUB(NOW(), INTERVAL 12 MONTH)')
            .groupBy('date')
            .orderBy('date', 'ASC');

        const results = await query.getRawMany();
        
        return results.map(row => ({
            date: row.date,
            value: Number(row.value),
        }));
    }

    private getPaymentMethodDistribution(invoices: Invoice[]) {
        const totalAmount = invoices.reduce((sum, inv) => sum + Number(inv.totalAmount), 0);
        const totalCount = invoices.length;

        // Simulate payment method distribution
        return [
            { method: 'Bank Transfer', count: Math.floor(totalCount * 0.6), amount: totalAmount * 0.6, percentage: 60 },
            { method: 'Credit Card', count: Math.floor(totalCount * 0.25), amount: totalAmount * 0.25, percentage: 25 },
            { method: 'Check', count: Math.floor(totalCount * 0.10), amount: totalAmount * 0.10, percentage: 10 },
            { method: 'Cash', count: Math.floor(totalCount * 0.05), amount: totalAmount * 0.05, percentage: 5 },
        ];
    }

    private calculatePaymentTimeliness(invoices: Invoice[]) {
        const currentDate = new Date();
        let onTimeCount = 0;
        let lateCount = 0;
        let totalDaysEarly = 0;
        let totalDaysLate = 0;
        let earlyCount = 0;

        invoices.forEach(invoice => {
            const dueDate = new Date(invoice.dueDate);
            const daysDiff = Math.floor((currentDate.getTime() - dueDate.getTime()) / (1000 * 3600 * 24));
            
            if (daysDiff <= 0) {
                onTimeCount++;
                if (daysDiff < 0) {
                    totalDaysEarly += Math.abs(daysDiff);
                    earlyCount++;
                }
            } else {
                lateCount++;
                totalDaysLate += daysDiff;
            }
        });

        const total = invoices.length;
        
        return {
            onTime: onTimeCount,
            late: lateCount,
            avgDaysEarly: earlyCount > 0 ? Math.round(totalDaysEarly / earlyCount) : 0,
            avgDaysLate: lateCount > 0 ? Math.round(totalDaysLate / lateCount) : 0,
            timelinessRate: total > 0 ? Math.round((onTimeCount / total) * 100) : 0,
        };
    }

    private async getPaymentTrends(tenantId: string, dateRange: DateRangeDto): Promise<TimeSeriesDataPointDto[]> {
        return this.getRevenueTrends(tenantId, dateRange); // Reuse revenue trends for payment trends
    }

    private calculateCollectionEfficiency(invoices: Invoice[]) {
        const currentDate = new Date();
        let totalOutstanding = 0;
        let totalCollected = 0;
        let collectionTimes: number[] = [];

        invoices.forEach(invoice => {
            const dueDate = new Date(invoice.dueDate);
            const amount = Number(invoice.totalAmount);
            
            if (dueDate < currentDate) {
                totalCollected += amount;
                const collectionDays = Math.floor((dueDate.getTime() - new Date(invoice.issueDate).getTime()) / (1000 * 3600 * 24));
                collectionTimes.push(collectionDays);
            } else {
                totalOutstanding += amount;
            }
        });

        const totalAmount = totalOutstanding + totalCollected;
        const collectionRate = totalAmount > 0 ? (totalCollected / totalAmount) * 100 : 0;
        const avgCollectionTime = collectionTimes.length > 0 
            ? collectionTimes.reduce((sum, time) => sum + time, 0) / collectionTimes.length 
            : 0;

        return {
            totalOutstanding,
            totalCollected,
            collectionRate: Math.round(collectionRate),
            avgCollectionTime: Math.round(avgCollectionTime),
        };
    }
}