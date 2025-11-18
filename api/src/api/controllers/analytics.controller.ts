import {
    Controller,
    Get,
    Query,
    Logger,
    Request,
    BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AnalyticsService } from '../../application/analytics/analytics.service';
import { Authorize } from '../../infrastructure/auth/decorators/authorize.decorator';
import { RoleName } from '../../domain/enums/role-name.enum';
import { 
    AnalyticsQueryDto, 
    AnalyticsMetaSummaryDto 
} from '../../application/analytics/dto/analytics-response.dto';
import { 
    RevenueTrendDto, 
    MonthlyRevenueDto, 
    QuarterlyRevenueDto 
} from '../../application/analytics/dto/revenue-trend.dto';
import { 
    TenantMetricsDto, 
    TopCustomerDto 
} from '../../application/analytics/dto/tenant-metrics.dto';
import { 
    InvoiceStatusOverviewDto, 
    InvoiceAgingDto 
} from '../../application/analytics/dto/invoice-status.dto';
import { 
    InvoiceValueDistributionDto 
} from '../../application/analytics/dto/payment-distribution.dto';
import { AnalyticsException, AnalyticsErrorCode } from '../../application/analytics/interfaces/analytics-errors.interface';

interface RequestWithUserRoles extends Request {
    userRoles: RoleName[];
    tenantId?: string;
}

@ApiTags('Analytics')
@ApiBearerAuth()
@Controller('analytics')
@Authorize(RoleName.ADMIN, RoleName.SUPER_ADMIN)
export class AnalyticsController {
    private readonly logger = new Logger(AnalyticsController.name);

    constructor(private readonly analyticsService: AnalyticsService) {}

    @Get('summary')
    @ApiOperation({ 
        summary: 'Get analytics meta summary',
        description: 'Returns high-level analytics summary including total invoices, revenue, tenants, and average invoice value'
    })
    @ApiResponse({ 
        status: 200, 
        description: 'Analytics summary retrieved successfully',
        type: AnalyticsMetaSummaryDto
    })
    @ApiResponse({ 
        status: 403, 
        description: 'Insufficient permissions' 
    })
    @ApiResponse({ 
        status: 400, 
        description: 'Invalid query parameters' 
    })
    async getAnalyticsSummary(
        @Query() query: AnalyticsQueryDto,
        @Request() req: RequestWithUserRoles,
    ): Promise<AnalyticsMetaSummaryDto> {
        try {
            this.validateDateRange(query);
            return await this.analyticsService.getMetaSummary(
                query, 
                req.userRoles, 
                req.tenantId
            );
        } catch (error) {
            return this.handleAnalyticsError(error, 'analytics summary');
        }
    }

    @Get('revenue/trends')
    @ApiOperation({ 
        summary: 'Get daily revenue trends',
        description: 'Returns daily revenue trends with total revenue, invoice counts, and growth metrics'
    })
    @ApiResponse({ 
        status: 200, 
        description: 'Revenue trends retrieved successfully',
        type: RevenueTrendDto
    })
    @ApiResponse({ 
        status: 403, 
        description: 'Insufficient permissions' 
    })
    @ApiResponse({ 
        status: 400, 
        description: 'Invalid query parameters' 
    })
    async getRevenueTrends(
        @Query() query: AnalyticsQueryDto,
        @Request() req: RequestWithUserRoles,
    ): Promise<RevenueTrendDto> {
        try {
            this.validateDateRange(query);
            return await this.analyticsService.getRevenueTrends(
                query, 
                req.userRoles, 
                req.tenantId
            );
        } catch (error) {
            this.logger.error('Error retrieving revenue trends', error);
            throw error instanceof BadRequestException ? error : 
                new BadRequestException('Failed to retrieve revenue trends');
        }
    }

    @Get('revenue/monthly')
    @ApiOperation({ 
        summary: 'Get monthly revenue breakdown',
        description: 'Returns revenue data aggregated by month'
    })
    @ApiResponse({ 
        status: 200, 
        description: 'Monthly revenue data retrieved successfully',
        type: [MonthlyRevenueDto]
    })
    @ApiResponse({ 
        status: 403, 
        description: 'Insufficient permissions' 
    })
    @ApiResponse({ 
        status: 400, 
        description: 'Invalid query parameters' 
    })
    async getMonthlyRevenue(
        @Query() query: AnalyticsQueryDto,
        @Request() req: RequestWithUserRoles,
    ): Promise<MonthlyRevenueDto[]> {
        try {
            this.validateDateRange(query);
            return await this.analyticsService.getMonthlyRevenue(
                query, 
                req.userRoles, 
                req.tenantId
            );
        } catch (error) {
            this.logger.error('Error retrieving monthly revenue', error);
            throw error instanceof BadRequestException ? error : 
                new BadRequestException('Failed to retrieve monthly revenue data');
        }
    }

    @Get('revenue/quarterly')
    @ApiOperation({ 
        summary: 'Get quarterly revenue breakdown',
        description: 'Returns revenue data aggregated by quarter'
    })
    @ApiResponse({ 
        status: 200, 
        description: 'Quarterly revenue data retrieved successfully',
        type: [QuarterlyRevenueDto]
    })
    @ApiResponse({ 
        status: 403, 
        description: 'Insufficient permissions' 
    })
    @ApiResponse({ 
        status: 400, 
        description: 'Invalid query parameters' 
    })
    async getQuarterlyRevenue(
        @Query() query: AnalyticsQueryDto,
        @Request() req: RequestWithUserRoles,
    ): Promise<QuarterlyRevenueDto[]> {
        try {
            this.validateDateRange(query);
            return await this.analyticsService.getQuarterlyRevenue(
                query, 
                req.userRoles, 
                req.tenantId
            );
        } catch (error) {
            this.logger.error('Error retrieving quarterly revenue', error);
            throw error instanceof BadRequestException ? error : 
                new BadRequestException('Failed to retrieve quarterly revenue data');
        }
    }

    @Get('tenants/metrics')
    @ApiOperation({ 
        summary: 'Get tenant performance metrics',
        description: 'Returns tenant-based metrics including invoice counts, revenue, and payment timeliness'
    })
    @ApiResponse({ 
        status: 200, 
        description: 'Tenant metrics retrieved successfully',
        type: TenantMetricsDto
    })
    @ApiResponse({ 
        status: 403, 
        description: 'Insufficient permissions' 
    })
    @ApiResponse({ 
        status: 400, 
        description: 'Invalid query parameters' 
    })
    async getTenantMetrics(
        @Query() query: AnalyticsQueryDto,
        @Request() req: RequestWithUserRoles,
    ): Promise<TenantMetricsDto> {
        try {
            this.validateDateRange(query);
            return await this.analyticsService.getTenantMetrics(
                query, 
                req.userRoles, 
                req.tenantId
            );
        } catch (error) {
            this.logger.error('Error retrieving tenant metrics', error);
            throw error instanceof BadRequestException ? error : 
                new BadRequestException('Failed to retrieve tenant metrics');
        }
    }

    @Get('customers/top')
    @ApiOperation({ 
        summary: 'Get top customers by revenue',
        description: 'Returns top customers ranked by total revenue with invoice counts and percentages'
    })
    @ApiResponse({ 
        status: 200, 
        description: 'Top customers retrieved successfully',
        type: [TopCustomerDto]
    })
    @ApiResponse({ 
        status: 403, 
        description: 'Insufficient permissions' 
    })
    @ApiResponse({ 
        status: 400, 
        description: 'Invalid query parameters' 
    })
    async getTopCustomers(
        @Query() query: AnalyticsQueryDto,
        @Request() req: RequestWithUserRoles,
    ): Promise<TopCustomerDto[]> {
        try {
            this.validateDateRange(query);
            return await this.analyticsService.getTopCustomers(
                query, 
                req.userRoles, 
                req.tenantId
            );
        } catch (error) {
            this.logger.error('Error retrieving top customers', error);
            throw error instanceof BadRequestException ? error : 
                new BadRequestException('Failed to retrieve top customers data');
        }
    }

    @Get('invoices/status')
    @ApiOperation({ 
        summary: 'Get invoice status overview',
        description: 'Returns breakdown of invoices by status (paid, unpaid, overdue) with counts and amounts'
    })
    @ApiResponse({ 
        status: 200, 
        description: 'Invoice status overview retrieved successfully',
        type: InvoiceStatusOverviewDto
    })
    @ApiResponse({ 
        status: 403, 
        description: 'Insufficient permissions' 
    })
    @ApiResponse({ 
        status: 400, 
        description: 'Invalid query parameters' 
    })
    async getInvoiceStatusOverview(
        @Query() query: AnalyticsQueryDto,
        @Request() req: RequestWithUserRoles,
    ): Promise<InvoiceStatusOverviewDto> {
        try {
            this.validateDateRange(query);
            return await this.analyticsService.getInvoiceStatusOverview(
                query, 
                req.userRoles, 
                req.tenantId
            );
        } catch (error) {
            this.logger.error('Error retrieving invoice status overview', error);
            throw error instanceof BadRequestException ? error : 
                new BadRequestException('Failed to retrieve invoice status overview');
        }
    }

    @Get('invoices/aging')
    @ApiOperation({ 
        summary: 'Get invoice aging analysis',
        description: 'Returns analysis of unpaid invoices by age ranges with amounts and percentages'
    })
    @ApiResponse({ 
        status: 200, 
        description: 'Invoice aging analysis retrieved successfully',
        type: InvoiceAgingDto
    })
    @ApiResponse({ 
        status: 403, 
        description: 'Insufficient permissions' 
    })
    @ApiResponse({ 
        status: 400, 
        description: 'Invalid query parameters' 
    })
    async getInvoiceAging(
        @Query() query: AnalyticsQueryDto,
        @Request() req: RequestWithUserRoles,
    ): Promise<InvoiceAgingDto> {
        try {
            this.validateDateRange(query);
            return await this.analyticsService.getInvoiceAging(
                query, 
                req.userRoles, 
                req.tenantId
            );
        } catch (error) {
            this.logger.error('Error retrieving invoice aging analysis', error);
            throw error instanceof BadRequestException ? error : 
                new BadRequestException('Failed to retrieve invoice aging analysis');
        }
    }

    @Get('invoices/value-distribution')
    @ApiOperation({ 
        summary: 'Get invoice value distribution',
        description: 'Returns distribution of invoices by value ranges with statistics'
    })
    @ApiResponse({ 
        status: 200, 
        description: 'Invoice value distribution retrieved successfully',
        type: InvoiceValueDistributionDto
    })
    @ApiResponse({ 
        status: 403, 
        description: 'Insufficient permissions' 
    })
    @ApiResponse({ 
        status: 400, 
        description: 'Invalid query parameters' 
    })
    async getInvoiceValueDistribution(
        @Query() query: AnalyticsQueryDto,
        @Request() req: RequestWithUserRoles,
    ): Promise<InvoiceValueDistributionDto> {
        try {
            this.validateDateRange(query);
            return await this.analyticsService.getInvoiceValueDistribution(
                query, 
                req.userRoles, 
                req.tenantId
            );
        } catch (error) {
            this.logger.error('Error retrieving invoice value distribution', error);
            throw error instanceof BadRequestException ? error : 
                new BadRequestException('Failed to retrieve invoice value distribution');
        }
    }

    private validateDateRange(query: AnalyticsQueryDto): void {
        if (query.startDate && query.endDate) {
            const startDate = new Date(query.startDate);
            const endDate = new Date(query.endDate);
            
            if (startDate > endDate) {
                throw new BadRequestException('Start date cannot be later than end date');
            }
            
            // Check for reasonable date range (not more than 5 years)
            const maxDays = 365 * 5;
            const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            
            if (diffDays > maxDays) {
                throw new BadRequestException('Date range cannot exceed 5 years');
            }
        }

        if (query.limit && (query.limit < 1 || query.limit > 100)) {
            throw new BadRequestException('Limit must be between 1 and 100');
        }

        if (query.page && query.page < 1) {
            throw new BadRequestException('Page must be greater than 0');
        }
    }

    private handleAnalyticsError(error: any, operation: string): never {
        this.logger.error(`Error retrieving ${operation}`, {
            error: error.message || error,
            stack: error.stack
        });

        if (error instanceof AnalyticsException) {
            switch (error.code) {
                case AnalyticsErrorCode.INVALID_DATE_RANGE:
                case AnalyticsErrorCode.INVALID_PARAMETERS:
                    throw new BadRequestException(error.message);
                case AnalyticsErrorCode.INSUFFICIENT_PERMISSIONS:
                case AnalyticsErrorCode.TENANT_NOT_FOUND:
                    throw new BadRequestException(error.message);
                case AnalyticsErrorCode.DATABASE_QUERY_ERROR:
                case AnalyticsErrorCode.CACHE_ERROR:
                    throw new BadRequestException(`Failed to retrieve ${operation}`);
                case AnalyticsErrorCode.NO_DATA_AVAILABLE:
                    throw new BadRequestException(`No data available for ${operation}`);
                default:
                    throw new BadRequestException(`Failed to retrieve ${operation}`);
            }
        }

        if (error instanceof BadRequestException) {
            throw error;
        }

        throw new BadRequestException(`Failed to retrieve ${operation}`);
    }
}