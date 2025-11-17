import {
    Controller,
    Get,
    Query,
    Req,
    HttpStatus,
    Inject,
    ValidationPipe,
    UsePipes,
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
import {
    AnalyticsDashboardDto,
    AnalyticsQueryDto,
    AnalyticsPeriodType,
} from '../../application/analytics/dto/analytics-response.dto';
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
@UsePipes(new ValidationPipe({ transform: true }))
export class AnalyticsController {
    constructor(
        @Inject(ANALYTICS_SERVICE) 
        private readonly analyticsService: IAnalyticsService,
    ) {}

    @Get('dashboard')
    @Authorize(RoleName.ADMIN, RoleName.SUPER_ADMIN)
    @ApiOperation({
        summary: 'Get comprehensive analytics dashboard',
        description: 'Retrieves all analytics metrics in a single response for dashboard display',
    })
    @ApiQuery({
        name: 'startDate',
        required: false,
        type: String,
        description: 'Start date for analytics (YYYY-MM-DD)',
        example: '2024-01-01',
    })
    @ApiQuery({
        name: 'endDate',
        required: false,
        type: String,
        description: 'End date for analytics (YYYY-MM-DD)',
        example: '2024-12-31',
    })
    @ApiQuery({
        name: 'periodType',
        required: false,
        enum: AnalyticsPeriodType,
        description: 'Period grouping for time-based data',
    })
    @ApiQuery({
        name: 'tenantId',
        required: false,
        type: String,
        description: 'Filter by specific tenant (Super Admin only)',
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Analytics dashboard data retrieved successfully',
        type: AnalyticsDashboardDto,
    })
    @ApiUnauthorizedResponse({ description: 'Unauthorized' })
    @ApiForbiddenResponse({ description: 'Forbidden - requires Admin or Super Admin role' })
    async getDashboard(
        @Query() queryParams: AnalyticsQueryDto,
        @Req() request: RequestWithUserRoles,
    ): Promise<AnalyticsDashboardDto> {
        const tenantId = this.getTenantIdForQuery(request, queryParams.tenantId);
        return this.analyticsService.getDashboardAnalytics(queryParams, tenantId);
    }

    @Get('revenue-trend')
    @Authorize(RoleName.ADMIN, RoleName.SUPER_ADMIN)
    @ApiOperation({
        summary: 'Get revenue trend analytics',
        description: 'Retrieves revenue trends over time with growth analysis',
    })
    @ApiQuery({
        name: 'startDate',
        required: false,
        type: String,
        description: 'Start date for analytics (YYYY-MM-DD)',
    })
    @ApiQuery({
        name: 'endDate',
        required: false,
        type: String,
        description: 'End date for analytics (YYYY-MM-DD)',
    })
    @ApiQuery({
        name: 'periodType',
        required: false,
        enum: AnalyticsPeriodType,
        description: 'Period grouping for time-based data',
    })
    @ApiQuery({
        name: 'tenantId',
        required: false,
        type: String,
        description: 'Filter by specific tenant (Super Admin only)',
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Revenue trend data retrieved successfully',
        type: RevenueTrendDto,
    })
    @ApiUnauthorizedResponse({ description: 'Unauthorized' })
    @ApiForbiddenResponse({ description: 'Forbidden - requires Admin or Super Admin role' })
    async getRevenueTrend(
        @Query() queryParams: AnalyticsQueryDto,
        @Req() request: RequestWithUserRoles,
    ): Promise<RevenueTrendDto> {
        const tenantId = this.getTenantIdForQuery(request, queryParams.tenantId);
        return this.analyticsService.getRevenueTrend(queryParams, tenantId);
    }

    @Get('tenant-metrics')
    @Authorize(RoleName.ADMIN, RoleName.SUPER_ADMIN)
    @ApiOperation({
        summary: 'Get tenant performance metrics',
        description: 'Retrieves tenant-specific performance analytics and comparisons',
    })
    @ApiQuery({
        name: 'startDate',
        required: false,
        type: String,
        description: 'Start date for analytics (YYYY-MM-DD)',
    })
    @ApiQuery({
        name: 'endDate',
        required: false,
        type: String,
        description: 'End date for analytics (YYYY-MM-DD)',
    })
    @ApiQuery({
        name: 'tenantId',
        required: false,
        type: String,
        description: 'Filter by specific tenant (Super Admin only)',
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Tenant metrics retrieved successfully',
        type: TenantMetricsDto,
    })
    @ApiUnauthorizedResponse({ description: 'Unauthorized' })
    @ApiForbiddenResponse({ description: 'Forbidden - requires Admin or Super Admin role' })
    async getTenantMetrics(
        @Query() queryParams: AnalyticsQueryDto,
        @Req() request: RequestWithUserRoles,
    ): Promise<TenantMetricsDto> {
        const tenantId = this.getTenantIdForQuery(request, queryParams.tenantId);
        return this.analyticsService.getTenantMetrics(queryParams, tenantId);
    }

    @Get('invoice-status')
    @Authorize(RoleName.ADMIN, RoleName.SUPER_ADMIN)
    @ApiOperation({
        summary: 'Get invoice status overview',
        description: 'Retrieves invoice status breakdown and aging analysis',
    })
    @ApiQuery({
        name: 'startDate',
        required: false,
        type: String,
        description: 'Start date for analytics (YYYY-MM-DD)',
    })
    @ApiQuery({
        name: 'endDate',
        required: false,
        type: String,
        description: 'End date for analytics (YYYY-MM-DD)',
    })
    @ApiQuery({
        name: 'tenantId',
        required: false,
        type: String,
        description: 'Filter by specific tenant (Super Admin only)',
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Invoice status overview retrieved successfully',
        type: InvoiceStatusOverviewDto,
    })
    @ApiUnauthorizedResponse({ description: 'Unauthorized' })
    @ApiForbiddenResponse({ description: 'Forbidden - requires Admin or Super Admin role' })
    async getInvoiceStatusOverview(
        @Query() queryParams: AnalyticsQueryDto,
        @Req() request: RequestWithUserRoles,
    ): Promise<InvoiceStatusOverviewDto> {
        const tenantId = this.getTenantIdForQuery(request, queryParams.tenantId);
        return this.analyticsService.getInvoiceStatusOverview(queryParams, tenantId);
    }

    @Get('payment-distribution')
    @Authorize(RoleName.ADMIN, RoleName.SUPER_ADMIN)
    @ApiOperation({
        summary: 'Get payment distribution analytics',
        description: 'Retrieves payment method distribution and timing analysis',
    })
    @ApiQuery({
        name: 'startDate',
        required: false,
        type: String,
        description: 'Start date for analytics (YYYY-MM-DD)',
    })
    @ApiQuery({
        name: 'endDate',
        required: false,
        type: String,
        description: 'End date for analytics (YYYY-MM-DD)',
    })
    @ApiQuery({
        name: 'tenantId',
        required: false,
        type: String,
        description: 'Filter by specific tenant (Super Admin only)',
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Payment distribution data retrieved successfully',
        type: PaymentDistributionDto,
    })
    @ApiUnauthorizedResponse({ description: 'Unauthorized' })
    @ApiForbiddenResponse({ description: 'Forbidden - requires Admin or Super Admin role' })
    async getPaymentDistribution(
        @Query() queryParams: AnalyticsQueryDto,
        @Req() request: RequestWithUserRoles,
    ): Promise<PaymentDistributionDto> {
        const tenantId = this.getTenantIdForQuery(request, queryParams.tenantId);
        return this.analyticsService.getPaymentDistribution(queryParams, tenantId);
    }

    private getTenantIdForQuery(
        request: RequestWithUserRoles,
        queryTenantId?: string,
    ): string | undefined {
        // Super Admin can query any tenant or all tenants
        if (request.userRoles?.includes(RoleName.SUPER_ADMIN)) {
            return queryTenantId; // Can be undefined for all tenants
        }
        
        // Admin can only query their own tenant
        return request.tenantId;
    }
}