import {
    Controller,
    Get,
    Query,
    HttpStatus,
    Inject,
    Req,
    BadRequestException,
} from '@nestjs/common';
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiBearerAuth,
    ApiUnauthorizedResponse,
    ApiForbiddenResponse,
    ApiQuery,
} from '@nestjs/swagger';
import { Authorize } from '../../infrastructure/auth/decorators/authorize.decorator';
import { RoleName } from '../../domain/enums/role-name.enum';
import { RequestWithTenant } from '../../infrastructure/middleware/request-with-tenant.interface';
import {
    ANALYTICS_SERVICE,
    IAnalyticsService,
} from '../../application/analytics/interfaces/analytics.service.interface';
import { AnalyticsSummaryDto, AnalyticsQueryDto } from '../../application/analytics/dto/analytics-response.dto';
import { RevenueTrendDto } from '../../application/analytics/dto/revenue-trend.dto';
import { TenantMetricsDto } from '../../application/analytics/dto/tenant-metrics.dto';
import { InvoiceStatusOverviewDto } from '../../application/analytics/dto/invoice-status.dto';
import { PaymentDistributionDto } from '../../application/analytics/dto/payment-distribution.dto';

interface RequestWithUserRoles extends RequestWithTenant {
    userRoles?: RoleName[];
}

@ApiTags('Analytics')
@ApiBearerAuth()
@Controller('analytics')
export class AnalyticsController {
    constructor(
        @Inject(ANALYTICS_SERVICE) 
        private readonly analyticsService: IAnalyticsService,
    ) {}

    @Get('summary')
    @Authorize(RoleName.ADMIN, RoleName.SUPER_ADMIN)
    @ApiOperation({
        summary: 'Get analytics summary',
        description: 'Retrieves key analytics metrics including invoice counts, revenue, and status overview',
    })
    @ApiQuery({
        name: 'startDate',
        required: false,
        type: String,
        description: 'Start date for analytics query (ISO format: YYYY-MM-DD)',
        example: '2024-01-01',
    })
    @ApiQuery({
        name: 'endDate',
        required: false,
        type: String,
        description: 'End date for analytics query (ISO format: YYYY-MM-DD)',
        example: '2024-12-31',
    })
    @ApiQuery({
        name: 'tenantId',
        required: false,
        type: String,
        description: 'Tenant ID filter (Super Admin only)',
        example: '123e4567-e89b-12d3-a456-426614174000',
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Analytics summary retrieved successfully',
        type: AnalyticsSummaryDto,
    })
    @ApiUnauthorizedResponse({ description: 'Unauthorized' })
    @ApiForbiddenResponse({ description: 'Forbidden - requires ADMIN or SUPER_ADMIN role' })
    async getAnalyticsSummary(
        @Query() query: AnalyticsQueryDto,
        @Req() request: RequestWithUserRoles,
    ): Promise<AnalyticsSummaryDto> {
        const isSuperAdmin = this.isSuperAdmin(request.userRoles);
        const userTenantId = request.tenantId;

        this.validateTenantFilter(query.tenantId, isSuperAdmin);
        this.validateDateRange(query.startDate, query.endDate);

        return this.analyticsService.getAnalyticsSummary(query, userTenantId, isSuperAdmin);
    }

    @Get('revenue-trend')
    @Authorize(RoleName.ADMIN, RoleName.SUPER_ADMIN)
    @ApiOperation({
        summary: 'Get revenue trend',
        description: 'Retrieves revenue trends over time with configurable period aggregation',
    })
    @ApiQuery({
        name: 'period',
        required: false,
        enum: ['daily', 'weekly', 'monthly', 'quarterly'],
        description: 'Period for revenue trend aggregation',
        example: 'monthly',
    })
    @ApiQuery({
        name: 'startDate',
        required: false,
        type: String,
        description: 'Start date for analytics query (ISO format: YYYY-MM-DD)',
        example: '2024-01-01',
    })
    @ApiQuery({
        name: 'endDate',
        required: false,
        type: String,
        description: 'End date for analytics query (ISO format: YYYY-MM-DD)',
        example: '2024-12-31',
    })
    @ApiQuery({
        name: 'tenantId',
        required: false,
        type: String,
        description: 'Tenant ID filter (Super Admin only)',
        example: '123e4567-e89b-12d3-a456-426614174000',
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Revenue trend retrieved successfully',
        type: RevenueTrendDto,
    })
    @ApiUnauthorizedResponse({ description: 'Unauthorized' })
    @ApiForbiddenResponse({ description: 'Forbidden - requires ADMIN or SUPER_ADMIN role' })
    async getRevenueTrend(
        @Query() query: AnalyticsQueryDto & { period?: 'daily' | 'weekly' | 'monthly' | 'quarterly' },
        @Req() request: RequestWithUserRoles,
    ): Promise<RevenueTrendDto> {
        const isSuperAdmin = this.isSuperAdmin(request.userRoles);
        const userTenantId = request.tenantId;
        const period = query.period || 'monthly';

        this.validateTenantFilter(query.tenantId, isSuperAdmin);
        this.validateDateRange(query.startDate, query.endDate);

        return this.analyticsService.getRevenueTrend(query, period, userTenantId, isSuperAdmin);
    }

    @Get('tenant-metrics')
    @Authorize(RoleName.ADMIN, RoleName.SUPER_ADMIN)
    @ApiOperation({
        summary: 'Get tenant performance metrics',
        description: 'Retrieves performance metrics for tenants including invoice counts, revenue, and payment timeliness',
    })
    @ApiQuery({
        name: 'startDate',
        required: false,
        type: String,
        description: 'Start date for analytics query (ISO format: YYYY-MM-DD)',
        example: '2024-01-01',
    })
    @ApiQuery({
        name: 'endDate',
        required: false,
        type: String,
        description: 'End date for analytics query (ISO format: YYYY-MM-DD)',
        example: '2024-12-31',
    })
    @ApiQuery({
        name: 'tenantId',
        required: false,
        type: String,
        description: 'Tenant ID filter (Super Admin only)',
        example: '123e4567-e89b-12d3-a456-426614174000',
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Tenant metrics retrieved successfully',
        type: TenantMetricsDto,
    })
    @ApiUnauthorizedResponse({ description: 'Unauthorized' })
    @ApiForbiddenResponse({ description: 'Forbidden - requires ADMIN or SUPER_ADMIN role' })
    async getTenantMetrics(
        @Query() query: AnalyticsQueryDto,
        @Req() request: RequestWithUserRoles,
    ): Promise<TenantMetricsDto> {
        const isSuperAdmin = this.isSuperAdmin(request.userRoles);
        const userTenantId = request.tenantId;

        this.validateTenantFilter(query.tenantId, isSuperAdmin);
        this.validateDateRange(query.startDate, query.endDate);

        return this.analyticsService.getTenantMetrics(query, userTenantId, isSuperAdmin);
    }

    @Get('invoice-status')
    @Authorize(RoleName.ADMIN, RoleName.SUPER_ADMIN)
    @ApiOperation({
        summary: 'Get invoice status overview',
        description: 'Retrieves invoice status distribution and aging analysis for unpaid invoices',
    })
    @ApiQuery({
        name: 'startDate',
        required: false,
        type: String,
        description: 'Start date for analytics query (ISO format: YYYY-MM-DD)',
        example: '2024-01-01',
    })
    @ApiQuery({
        name: 'endDate',
        required: false,
        type: String,
        description: 'End date for analytics query (ISO format: YYYY-MM-DD)',
        example: '2024-12-31',
    })
    @ApiQuery({
        name: 'tenantId',
        required: false,
        type: String,
        description: 'Tenant ID filter (Super Admin only)',
        example: '123e4567-e89b-12d3-a456-426614174000',
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Invoice status overview retrieved successfully',
        type: InvoiceStatusOverviewDto,
    })
    @ApiUnauthorizedResponse({ description: 'Unauthorized' })
    @ApiForbiddenResponse({ description: 'Forbidden - requires ADMIN or SUPER_ADMIN role' })
    async getInvoiceStatusOverview(
        @Query() query: AnalyticsQueryDto,
        @Req() request: RequestWithUserRoles,
    ): Promise<InvoiceStatusOverviewDto> {
        const isSuperAdmin = this.isSuperAdmin(request.userRoles);
        const userTenantId = request.tenantId;

        this.validateTenantFilter(query.tenantId, isSuperAdmin);
        this.validateDateRange(query.startDate, query.endDate);

        return this.analyticsService.getInvoiceStatusOverview(query, userTenantId, isSuperAdmin);
    }

    @Get('payment-distribution')
    @Authorize(RoleName.ADMIN, RoleName.SUPER_ADMIN)
    @ApiOperation({
        summary: 'Get payment distribution analytics',
        description: 'Retrieves payment distribution by method, timing, and amount ranges',
    })
    @ApiQuery({
        name: 'startDate',
        required: false,
        type: String,
        description: 'Start date for analytics query (ISO format: YYYY-MM-DD)',
        example: '2024-01-01',
    })
    @ApiQuery({
        name: 'endDate',
        required: false,
        type: String,
        description: 'End date for analytics query (ISO format: YYYY-MM-DD)',
        example: '2024-12-31',
    })
    @ApiQuery({
        name: 'tenantId',
        required: false,
        type: String,
        description: 'Tenant ID filter (Super Admin only)',
        example: '123e4567-e89b-12d3-a456-426614174000',
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Payment distribution retrieved successfully',
        type: PaymentDistributionDto,
    })
    @ApiUnauthorizedResponse({ description: 'Unauthorized' })
    @ApiForbiddenResponse({ description: 'Forbidden - requires ADMIN or SUPER_ADMIN role' })
    async getPaymentDistribution(
        @Query() query: AnalyticsQueryDto,
        @Req() request: RequestWithUserRoles,
    ): Promise<PaymentDistributionDto> {
        const isSuperAdmin = this.isSuperAdmin(request.userRoles);
        const userTenantId = request.tenantId;

        this.validateTenantFilter(query.tenantId, isSuperAdmin);
        this.validateDateRange(query.startDate, query.endDate);

        return this.analyticsService.getPaymentDistribution(query, userTenantId, isSuperAdmin);
    }

    private isSuperAdmin(userRoles?: RoleName[]): boolean {
        return userRoles?.includes(RoleName.SUPER_ADMIN) ?? false;
    }

    private validateTenantFilter(tenantId?: string, isSuperAdmin?: boolean): void {
        if (tenantId && !isSuperAdmin) {
            throw new BadRequestException('Only Super Admin users can filter by tenant ID');
        }
    }

    private validateDateRange(startDate?: string, endDate?: string): void {
        if (startDate && endDate) {
            const start = new Date(startDate);
            const end = new Date(endDate);
            
            if (start > end) {
                throw new BadRequestException('Start date must be before or equal to end date');
            }
            
            // Validate that dates are not too far in the future
            const maxDate = new Date();
            maxDate.setFullYear(maxDate.getFullYear() + 1);
            
            if (start > maxDate || end > maxDate) {
                throw new BadRequestException('Dates cannot be more than 1 year in the future');
            }
        }

        // Individual date validation
        if (startDate) {
            const start = new Date(startDate);
            if (isNaN(start.getTime())) {
                throw new BadRequestException('Invalid start date format. Use YYYY-MM-DD');
            }
        }

        if (endDate) {
            const end = new Date(endDate);
            if (isNaN(end.getTime())) {
                throw new BadRequestException('Invalid end date format. Use YYYY-MM-DD');
            }
        }
    }
}