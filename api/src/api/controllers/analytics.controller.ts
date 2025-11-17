import {
    Controller,
    Get,
    Query,
    Req,
    HttpStatus,
    Inject,
    ForbiddenException,
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

import { RoleName } from '../../domain/enums/role-name.enum';
import { Authorize } from '../../infrastructure/auth/decorators/authorize.decorator';
import { RequestWithTenant } from '../../infrastructure/middleware/request-with-tenant.interface';
import {
    IAnalyticsService,
    ANALYTICS_SERVICE,
} from '../../application/analytics/interfaces/analytics.service.interface';
import { AnalyticsResponseDto } from '../../application/analytics/dto/analytics-response.dto';
import { RevenueTrendDto, TopCustomerDto } from '../../application/analytics/dto/revenue-trend.dto';
import { TenantMetricsDto } from '../../application/analytics/dto/tenant-metrics.dto';
import { InvoiceStatusOverviewDto } from '../../application/analytics/dto/invoice-status.dto';
import { PaymentDistributionDto } from '../../application/analytics/dto/payment-distribution.dto';
import { AnalyticsQueryDto, PeriodType } from '../../application/analytics/dto/analytics-query.dto';

interface RequestingUserContext {
    isSuperAdmin: boolean;
    tenantId?: string;
}

@ApiTags('Analytics')
@ApiBearerAuth()
@Controller('analytics')
@Authorize(RoleName.ADMIN, RoleName.SUPER_ADMIN)
export class AnalyticsController {
    constructor(
        @Inject(ANALYTICS_SERVICE)
        private readonly analyticsService: IAnalyticsService,
    ) {}

    private _getRequestingUserContext(req: RequestWithTenant): RequestingUserContext {
        const isSuperAdmin: boolean = req.userRoles!.includes(RoleName.SUPER_ADMIN);
        const tenantId: string | undefined = isSuperAdmin ? undefined : req.tenantId!;

        return { isSuperAdmin, tenantId };
    }

    private _validateTenantAccess(query: AnalyticsQueryDto, userContext: RequestingUserContext): void {
        // If user is not Super Admin and tries to specify a tenantId
        if (!userContext.isSuperAdmin && query.tenantId) {
            throw new ForbiddenException('Only Super Admin can specify tenant filters');
        }

        // If non-Super Admin doesn't have a tenantId
        if (!userContext.isSuperAdmin && !userContext.tenantId) {
            throw new ForbiddenException('Admin user must belong to a tenant');
        }
    }

    @Get()
    @ApiOperation({
        summary: 'Get analytics overview',
        description: 'Retrieves comprehensive analytics data including revenue trends, tenant metrics, invoice status overview, and payment distribution',
    })
    @ApiQuery({ name: 'startDate', required: false, type: String, description: 'Start date (ISO format)', example: '2024-01-01' })
    @ApiQuery({ name: 'endDate', required: false, type: String, description: 'End date (ISO format)', example: '2024-12-31' })
    @ApiQuery({ name: 'periodType', required: false, enum: PeriodType, description: 'Period type for trends', example: 'monthly' })
    @ApiQuery({ name: 'tenantId', required: false, type: String, description: 'Specific tenant ID (Super Admin only)' })
    @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Limit for top results', example: 10 })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Analytics overview retrieved successfully',
        type: AnalyticsResponseDto,
    })
    @ApiUnauthorizedResponse({ description: 'Unauthorized' })
    @ApiForbiddenResponse({ description: 'Forbidden - requires admin or super admin role' })
    async getAnalyticsOverview(
        @Query() query: AnalyticsQueryDto,
        @Req() req: RequestWithTenant,
    ): Promise<AnalyticsResponseDto> {
        const userContext = this._getRequestingUserContext(req);
        this._validateTenantAccess(query, userContext);

        return this.analyticsService.getAnalyticsOverview(
            query,
            userContext.tenantId,
            userContext.isSuperAdmin,
        );
    }

    @Get('revenue-trends')
    @ApiOperation({
        summary: 'Get revenue trends',
        description: 'Retrieves revenue trend data over time periods',
    })
    @ApiQuery({ name: 'startDate', required: false, type: String, description: 'Start date (ISO format)' })
    @ApiQuery({ name: 'endDate', required: false, type: String, description: 'End date (ISO format)' })
    @ApiQuery({ name: 'periodType', required: false, enum: PeriodType, description: 'Period type' })
    @ApiQuery({ name: 'tenantId', required: false, type: String, description: 'Tenant ID (Super Admin only)' })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Revenue trends retrieved successfully',
        type: [RevenueTrendDto],
    })
    @ApiUnauthorizedResponse({ description: 'Unauthorized' })
    @ApiForbiddenResponse({ description: 'Forbidden - requires admin or super admin role' })
    async getRevenueTrends(
        @Query() query: AnalyticsQueryDto,
        @Req() req: RequestWithTenant,
    ): Promise<RevenueTrendDto[]> {
        const userContext = this._getRequestingUserContext(req);
        this._validateTenantAccess(query, userContext);

        return this.analyticsService.getRevenueTrends(
            query,
            userContext.tenantId,
            userContext.isSuperAdmin,
        );
    }

    @Get('tenant-metrics')
    @ApiOperation({
        summary: 'Get tenant performance metrics',
        description: 'Retrieves performance metrics for tenants including invoice counts, revenue, and payment timeliness',
    })
    @ApiQuery({ name: 'startDate', required: false, type: String, description: 'Start date (ISO format)' })
    @ApiQuery({ name: 'endDate', required: false, type: String, description: 'End date (ISO format)' })
    @ApiQuery({ name: 'tenantId', required: false, type: String, description: 'Tenant ID (Super Admin only)' })
    @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Limit for results' })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Tenant metrics retrieved successfully',
        type: [TenantMetricsDto],
    })
    @ApiUnauthorizedResponse({ description: 'Unauthorized' })
    @ApiForbiddenResponse({ description: 'Forbidden - requires admin or super admin role' })
    async getTenantMetrics(
        @Query() query: AnalyticsQueryDto,
        @Req() req: RequestWithTenant,
    ): Promise<TenantMetricsDto[]> {
        const userContext = this._getRequestingUserContext(req);
        this._validateTenantAccess(query, userContext);

        return this.analyticsService.getTenantMetrics(
            query,
            userContext.tenantId,
            userContext.isSuperAdmin,
        );
    }

    @Get('invoice-status')
    @ApiOperation({
        summary: 'Get invoice status overview',
        description: 'Retrieves comprehensive invoice status overview including paid/unpaid/overdue counts and aging analysis',
    })
    @ApiQuery({ name: 'startDate', required: false, type: String, description: 'Start date (ISO format)' })
    @ApiQuery({ name: 'endDate', required: false, type: String, description: 'End date (ISO format)' })
    @ApiQuery({ name: 'tenantId', required: false, type: String, description: 'Tenant ID (Super Admin only)' })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Invoice status overview retrieved successfully',
        type: InvoiceStatusOverviewDto,
    })
    @ApiUnauthorizedResponse({ description: 'Unauthorized' })
    @ApiForbiddenResponse({ description: 'Forbidden - requires admin or super admin role' })
    async getInvoiceStatusOverview(
        @Query() query: AnalyticsQueryDto,
        @Req() req: RequestWithTenant,
    ): Promise<InvoiceStatusOverviewDto> {
        const userContext = this._getRequestingUserContext(req);
        this._validateTenantAccess(query, userContext);

        return this.analyticsService.getInvoiceStatusOverview(
            query,
            userContext.tenantId,
            userContext.isSuperAdmin,
        );
    }

    @Get('payment-distribution')
    @ApiOperation({
        summary: 'Get payment distribution',
        description: 'Retrieves payment distribution analytics by category',
    })
    @ApiQuery({ name: 'startDate', required: false, type: String, description: 'Start date (ISO format)' })
    @ApiQuery({ name: 'endDate', required: false, type: String, description: 'End date (ISO format)' })
    @ApiQuery({ name: 'tenantId', required: false, type: String, description: 'Tenant ID (Super Admin only)' })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Payment distribution retrieved successfully',
        type: [PaymentDistributionDto],
    })
    @ApiUnauthorizedResponse({ description: 'Unauthorized' })
    @ApiForbiddenResponse({ description: 'Forbidden - requires admin or super admin role' })
    async getPaymentDistribution(
        @Query() query: AnalyticsQueryDto,
        @Req() req: RequestWithTenant,
    ): Promise<PaymentDistributionDto[]> {
        const userContext = this._getRequestingUserContext(req);
        this._validateTenantAccess(query, userContext);

        return this.analyticsService.getPaymentDistribution(
            query,
            userContext.tenantId,
            userContext.isSuperAdmin,
        );
    }

    @Get('top-customers')
    @ApiOperation({
        summary: 'Get top customers',
        description: 'Retrieves top customers by revenue and invoice count',
    })
    @ApiQuery({ name: 'startDate', required: false, type: String, description: 'Start date (ISO format)' })
    @ApiQuery({ name: 'endDate', required: false, type: String, description: 'End date (ISO format)' })
    @ApiQuery({ name: 'tenantId', required: false, type: String, description: 'Tenant ID (Super Admin only)' })
    @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Limit for results' })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Top customers retrieved successfully',
        type: [TopCustomerDto],
    })
    @ApiUnauthorizedResponse({ description: 'Unauthorized' })
    @ApiForbiddenResponse({ description: 'Forbidden - requires admin or super admin role' })
    async getTopCustomers(
        @Query() query: AnalyticsQueryDto,
        @Req() req: RequestWithTenant,
    ): Promise<TopCustomerDto[]> {
        const userContext = this._getRequestingUserContext(req);
        this._validateTenantAccess(query, userContext);

        return this.analyticsService.getTopCustomers(
            query,
            userContext.tenantId,
            userContext.isSuperAdmin,
        );
    }
}