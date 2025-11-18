import {
    Controller,
    Get,
    Query,
    HttpStatus,
    Req,
    BadRequestException,
    UseInterceptors,
} from '@nestjs/common';
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiBearerAuth,
    ApiUnauthorizedResponse,
    ApiForbiddenResponse,
    ApiQuery,
    ApiOkResponse,
} from '@nestjs/swagger';
import { AnalyticsService } from '../../application/analytics/analytics.service';
import { Authorize } from '../../infrastructure/auth/decorators/authorize.decorator';
import { RoleName } from '../../domain/enums/role-name.enum';
import { RequestWithTenant } from '../../infrastructure/middleware/request-with-tenant.interface';
import { RevenueTrendDto, RevenueTrendQueryDto } from '../../application/analytics/dto/revenue-trend.dto';
import { TenantMetricsDto, TenantMetricsQueryDto } from '../../application/analytics/dto/tenant-metrics.dto';
import { InvoiceStatusOverviewDto, InvoiceStatusQueryDto } from '../../application/analytics/dto/invoice-status.dto';
import { PaymentDistributionDto, PaymentDistributionQueryDto } from '../../application/analytics/dto/payment-distribution.dto';
import { ComprehensiveAnalyticsDto, AnalyticsQueryDto, TopCustomerDto } from '../../application/analytics/dto/analytics-response.dto';
import { AnalyticsErrorInterceptor } from '../../application/analytics/interceptors/analytics-error.interceptor';

@ApiTags('Analytics')
@ApiBearerAuth()
@Controller('analytics')
@UseInterceptors(AnalyticsErrorInterceptor)
export class AnalyticsController {
    constructor(private readonly analyticsService: AnalyticsService) {}

    @Get('comprehensive')
    @Authorize(RoleName.ADMIN, RoleName.SUPER_ADMIN)
    @ApiOperation({
        summary: 'Get comprehensive analytics dashboard',
        description: 'Retrieves all analytics data including revenue trends, tenant metrics, invoice status, and payment distribution',
    })
    @ApiQuery({
        name: 'startDate',
        required: false,
        type: String,
        description: 'Start date for analytics (YYYY-MM-DD format)',
        example: '2024-01-01',
    })
    @ApiQuery({
        name: 'endDate',
        required: false,
        type: String,
        description: 'End date for analytics (YYYY-MM-DD format)',
        example: '2024-12-31',
    })
    @ApiQuery({
        name: 'tenantId',
        required: false,
        type: String,
        description: 'Filter by specific tenant (Super Admin only)',
    })
    @ApiQuery({
        name: 'includeRevenueTrends',
        required: false,
        type: Boolean,
        description: 'Include revenue trends in response',
        example: true,
    })
    @ApiQuery({
        name: 'includeTopCustomers',
        required: false,
        type: Boolean,
        description: 'Include top customers in response',
        example: true,
    })
    @ApiQuery({
        name: 'includeTenantMetrics',
        required: false,
        type: Boolean,
        description: 'Include tenant metrics in response',
        example: true,
    })
    @ApiQuery({
        name: 'includeInvoiceStatus',
        required: false,
        type: Boolean,
        description: 'Include invoice status overview in response',
        example: true,
    })
    @ApiQuery({
        name: 'includePaymentDistribution',
        required: false,
        type: Boolean,
        description: 'Include payment distribution in response',
        example: true,
    })
    @ApiOkResponse({
        description: 'Comprehensive analytics data retrieved successfully',
        type: ComprehensiveAnalyticsDto,
    })
    @ApiUnauthorizedResponse({ description: 'Unauthorized' })
    @ApiForbiddenResponse({ description: 'Forbidden - requires ADMIN or SUPER_ADMIN role' })
    async getComprehensiveAnalytics(
        @Req() request: RequestWithTenant,
        @Query() query: AnalyticsQueryDto,
    ): Promise<ComprehensiveAnalyticsDto> {
        const userRoles = request.userRoles || [];
        const isSuperAdmin = userRoles.includes(RoleName.SUPER_ADMIN);
        
        // Determine which tenants the user can access
        let tenantIds: string[];
        
        if (isSuperAdmin) {
            // Super Admin can filter by specific tenant or see all tenants
            if (query.tenantId) {
                tenantIds = [query.tenantId];
            } else {
                // Get all tenant IDs - for now we'll use the current tenant
                // In a real implementation, you'd fetch all tenant IDs
                tenantIds = request.tenantId ? [request.tenantId] : [];
            }
        } else {
            // Regular Admin can only see their own tenant
            if (!request.tenantId) {
                throw new BadRequestException('Tenant ID is required');
            }
            tenantIds = [request.tenantId];
        }

        if (tenantIds.length === 0) {
            throw new BadRequestException('No accessible tenants found');
        }

        return this.analyticsService.getComprehensiveAnalytics(tenantIds, query);
    }

    @Get('revenue-trends')
    @Authorize(RoleName.ADMIN, RoleName.SUPER_ADMIN)
    @ApiOperation({
        summary: 'Get revenue trends over time',
        description: 'Retrieves revenue trends with configurable time periods and date ranges',
    })
    @ApiQuery({
        name: 'startDate',
        required: false,
        type: String,
        description: 'Start date (YYYY-MM-DD format)',
        example: '2024-01-01',
    })
    @ApiQuery({
        name: 'endDate',
        required: false,
        type: String,
        description: 'End date (YYYY-MM-DD format)',
        example: '2024-12-31',
    })
    @ApiQuery({
        name: 'period',
        required: false,
        enum: ['daily', 'weekly', 'monthly', 'quarterly'],
        description: 'Aggregation period',
        example: 'monthly',
    })
    @ApiOkResponse({
        description: 'Revenue trends retrieved successfully',
        type: [RevenueTrendDto],
    })
    @ApiUnauthorizedResponse({ description: 'Unauthorized' })
    @ApiForbiddenResponse({ description: 'Forbidden - requires ADMIN or SUPER_ADMIN role' })
    async getRevenueTrends(
        @Req() request: RequestWithTenant,
        @Query() query: RevenueTrendQueryDto,
    ): Promise<RevenueTrendDto[]> {
        const tenantIds = this.getTenantIds(request);
        return this.analyticsService.getRevenueTrends(tenantIds, query);
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
        description: 'Start date (YYYY-MM-DD format)',
        example: '2024-01-01',
    })
    @ApiQuery({
        name: 'endDate',
        required: false,
        type: String,
        description: 'End date (YYYY-MM-DD format)',
        example: '2024-12-31',
    })
    @ApiQuery({
        name: 'limit',
        required: false,
        type: Number,
        description: 'Number of top tenants to return',
        example: 10,
    })
    @ApiQuery({
        name: 'sortBy',
        required: false,
        enum: ['revenue', 'invoiceCount', 'paymentTimeliness'],
        description: 'Sort criteria',
        example: 'revenue',
    })
    @ApiOkResponse({
        description: 'Tenant metrics retrieved successfully',
        type: [TenantMetricsDto],
    })
    @ApiUnauthorizedResponse({ description: 'Unauthorized' })
    @ApiForbiddenResponse({ description: 'Forbidden - requires ADMIN or SUPER_ADMIN role' })
    async getTenantMetrics(
        @Req() request: RequestWithTenant,
        @Query() query: TenantMetricsQueryDto,
    ): Promise<TenantMetricsDto[]> {
        const tenantIds = this.getTenantIds(request);
        return this.analyticsService.getTenantMetrics(tenantIds, query);
    }

    @Get('invoice-status')
    @Authorize(RoleName.ADMIN, RoleName.SUPER_ADMIN)
    @ApiOperation({
        summary: 'Get invoice status overview',
        description: 'Retrieves invoice status breakdown and aging analysis for overdue invoices',
    })
    @ApiQuery({
        name: 'startDate',
        required: false,
        type: String,
        description: 'Start date (YYYY-MM-DD format)',
        example: '2024-01-01',
    })
    @ApiQuery({
        name: 'endDate',
        required: false,
        type: String,
        description: 'End date (YYYY-MM-DD format)',
        example: '2024-12-31',
    })
    @ApiQuery({
        name: 'includeAging',
        required: false,
        type: Boolean,
        description: 'Include aging analysis for overdue invoices',
        example: true,
    })
    @ApiOkResponse({
        description: 'Invoice status overview retrieved successfully',
        type: InvoiceStatusOverviewDto,
    })
    @ApiUnauthorizedResponse({ description: 'Unauthorized' })
    @ApiForbiddenResponse({ description: 'Forbidden - requires ADMIN or SUPER_ADMIN role' })
    async getInvoiceStatusOverview(
        @Req() request: RequestWithTenant,
        @Query() query: InvoiceStatusQueryDto,
    ): Promise<InvoiceStatusOverviewDto> {
        const tenantIds = this.getTenantIds(request);
        return this.analyticsService.getInvoiceStatusOverview(tenantIds, query);
    }

    @Get('payment-distribution')
    @Authorize(RoleName.ADMIN, RoleName.SUPER_ADMIN)
    @ApiOperation({
        summary: 'Get payment distribution analysis',
        description: 'Retrieves payment distribution by method, timing, and amount ranges',
    })
    @ApiQuery({
        name: 'startDate',
        required: false,
        type: String,
        description: 'Start date (YYYY-MM-DD format)',
        example: '2024-01-01',
    })
    @ApiQuery({
        name: 'endDate',
        required: false,
        type: String,
        description: 'End date (YYYY-MM-DD format)',
        example: '2024-12-31',
    })
    @ApiQuery({
        name: 'includeMethods',
        required: false,
        type: Boolean,
        description: 'Include payment method breakdown',
        example: true,
    })
    @ApiQuery({
        name: 'includeTiming',
        required: false,
        type: Boolean,
        description: 'Include payment timing analysis',
        example: true,
    })
    @ApiQuery({
        name: 'includeAmountRanges',
        required: false,
        type: Boolean,
        description: 'Include amount range distribution',
        example: true,
    })
    @ApiOkResponse({
        description: 'Payment distribution retrieved successfully',
        type: PaymentDistributionDto,
    })
    @ApiUnauthorizedResponse({ description: 'Unauthorized' })
    @ApiForbiddenResponse({ description: 'Forbidden - requires ADMIN or SUPER_ADMIN role' })
    async getPaymentDistribution(
        @Req() request: RequestWithTenant,
        @Query() query: PaymentDistributionQueryDto,
    ): Promise<PaymentDistributionDto> {
        const tenantIds = this.getTenantIds(request);
        return this.analyticsService.getPaymentDistribution(tenantIds, query);
    }

    @Get('top-customers')
    @Authorize(RoleName.ADMIN, RoleName.SUPER_ADMIN)
    @ApiOperation({
        summary: 'Get top customers by revenue',
        description: 'Retrieves the highest revenue generating customers',
    })
    @ApiQuery({
        name: 'limit',
        required: false,
        type: Number,
        description: 'Number of top customers to return',
        example: 10,
    })
    @ApiOkResponse({
        description: 'Top customers retrieved successfully',
        type: [TopCustomerDto],
    })
    @ApiUnauthorizedResponse({ description: 'Unauthorized' })
    @ApiForbiddenResponse({ description: 'Forbidden - requires ADMIN or SUPER_ADMIN role' })
    async getTopCustomers(
        @Req() request: RequestWithTenant,
        @Query('limit') limit?: number,
    ): Promise<TopCustomerDto[]> {
        const tenantIds = this.getTenantIds(request);
        return this.analyticsService.getTopCustomers(tenantIds, limit);
    }

    private getTenantIds(request: RequestWithTenant): string[] {
        const userRoles = request.userRoles || [];
        const isSuperAdmin = userRoles.includes(RoleName.SUPER_ADMIN);
        
        if (isSuperAdmin) {
            // For now, Super Admin still sees only their tenant
            // In a full implementation, you'd have a way to fetch all tenant IDs
            return request.tenantId ? [request.tenantId] : [];
        } else {
            // Regular Admin can only see their own tenant
            return request.tenantId ? [request.tenantId] : [];
        }
    }
}