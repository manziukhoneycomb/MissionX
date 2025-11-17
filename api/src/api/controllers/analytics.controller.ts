import {
    Controller,
    Get,
    Query,
    Req,
    Inject,
    HttpStatus,
    BadRequestException,
    ParseIntPipe,
    DefaultValuePipe,
} from '@nestjs/common';
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiBearerAuth,
    ApiQuery,
    ApiUnauthorizedResponse,
    ApiForbiddenResponse,
    ApiBadRequestResponse,
} from '@nestjs/swagger';
import { Authorize } from '../../infrastructure/auth/decorators/authorize.decorator';
import { RoleName } from '../../domain/enums/role-name.enum';
import { RequestWithTenant } from '../../infrastructure/middleware/request-with-tenant.interface';
import {
    ANALYTICS_SERVICE,
    IAnalyticsService,
} from '../../application/analytics/interfaces/analytics.service.interface';
import { AnalyticsQueryDto } from '../../application/analytics/dto/analytics-response.dto';
import { RevenueTrendDto, TopCustomerDto } from '../../application/analytics/dto/revenue-trend.dto';
import { TenantPerformanceDto } from '../../application/analytics/dto/tenant-metrics.dto';
import { InvoiceStatusOverviewDto } from '../../application/analytics/dto/invoice-status.dto';
import { PaymentDistributionDto } from '../../application/analytics/dto/payment-distribution.dto';

@ApiTags('Analytics')
@ApiBearerAuth()
@Controller('analytics')
export class AnalyticsController {
    constructor(
        @Inject(ANALYTICS_SERVICE) private readonly analyticsService: IAnalyticsService,
    ) {}

    @Get('revenue-trends')
    @Authorize(RoleName.ADMIN, RoleName.SUPER_ADMIN)
    @ApiOperation({
        summary: 'Get revenue trends',
        description: 'Retrieves revenue trends over time with monthly aggregation',
    })
    @ApiQuery({
        name: 'startDate',
        required: true,
        type: String,
        description: 'Start date in YYYY-MM-DD format',
        example: '2024-01-01',
    })
    @ApiQuery({
        name: 'endDate',
        required: true,
        type: String,
        description: 'End date in YYYY-MM-DD format',
        example: '2024-12-31',
    })
    @ApiQuery({
        name: 'tenantIds',
        required: false,
        type: [String],
        description: 'Tenant IDs to filter by (Super Admin only)',
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Revenue trends retrieved successfully',
        type: RevenueTrendDto,
    })
    @ApiUnauthorizedResponse({ description: 'Unauthorized' })
    @ApiForbiddenResponse({ description: 'Forbidden - requires ADMIN or SUPER_ADMIN role' })
    @ApiBadRequestResponse({ description: 'Invalid date format or range' })
    async getRevenueTrends(
        @Query('startDate') startDate: string,
        @Query('endDate') endDate: string,
        @Query('tenantIds') tenantIds?: string | string[],
        @Req() request: RequestWithTenant,
    ): Promise<RevenueTrendDto> {
        this.validateDateRange(startDate, endDate);

        const query: AnalyticsQueryDto = {
            dateRange: { startDate, endDate },
            tenantIds: this.parseTenantIds(tenantIds),
        };

        // Admin users can only see their own tenant data
        const tenantId = this.getTenantIdForUser(request, query.tenantIds);
        
        return this.analyticsService.getRevenueTrends(query, tenantId);
    }

    @Get('top-customers')
    @Authorize(RoleName.ADMIN, RoleName.SUPER_ADMIN)
    @ApiOperation({
        summary: 'Get top customers by revenue',
        description: 'Retrieves top customers ranked by total revenue',
    })
    @ApiQuery({
        name: 'startDate',
        required: true,
        type: String,
        description: 'Start date in YYYY-MM-DD format',
        example: '2024-01-01',
    })
    @ApiQuery({
        name: 'endDate',
        required: true,
        type: String,
        description: 'End date in YYYY-MM-DD format',
        example: '2024-12-31',
    })
    @ApiQuery({
        name: 'limit',
        required: false,
        type: Number,
        description: 'Maximum number of customers to return',
        example: 10,
    })
    @ApiQuery({
        name: 'tenantIds',
        required: false,
        type: [String],
        description: 'Tenant IDs to filter by (Super Admin only)',
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Top customers retrieved successfully',
        type: [TopCustomerDto],
    })
    @ApiUnauthorizedResponse({ description: 'Unauthorized' })
    @ApiForbiddenResponse({ description: 'Forbidden - requires ADMIN or SUPER_ADMIN role' })
    @ApiBadRequestResponse({ description: 'Invalid date format or range' })
    async getTopCustomers(
        @Query('startDate') startDate: string,
        @Query('endDate') endDate: string,
        @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
        @Query('tenantIds') tenantIds?: string | string[],
        @Req() request: RequestWithTenant,
    ): Promise<TopCustomerDto[]> {
        this.validateDateRange(startDate, endDate);

        if (limit < 1 || limit > 100) {
            throw new BadRequestException('Limit must be between 1 and 100');
        }

        const query: AnalyticsQueryDto = {
            dateRange: { startDate, endDate },
            tenantIds: this.parseTenantIds(tenantIds),
        };

        const tenantId = this.getTenantIdForUser(request, query.tenantIds);
        
        return this.analyticsService.getTopCustomers(query, tenantId, limit);
    }

    @Get('tenant-performance')
    @Authorize(RoleName.ADMIN, RoleName.SUPER_ADMIN)
    @ApiOperation({
        summary: 'Get tenant performance metrics',
        description: 'Retrieves performance metrics for tenants including invoice counts and revenue',
    })
    @ApiQuery({
        name: 'startDate',
        required: true,
        type: String,
        description: 'Start date in YYYY-MM-DD format',
        example: '2024-01-01',
    })
    @ApiQuery({
        name: 'endDate',
        required: true,
        type: String,
        description: 'End date in YYYY-MM-DD format',
        example: '2024-12-31',
    })
    @ApiQuery({
        name: 'tenantIds',
        required: false,
        type: [String],
        description: 'Tenant IDs to filter by (Super Admin only)',
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Tenant performance metrics retrieved successfully',
        type: TenantPerformanceDto,
    })
    @ApiUnauthorizedResponse({ description: 'Unauthorized' })
    @ApiForbiddenResponse({ description: 'Forbidden - requires ADMIN or SUPER_ADMIN role' })
    @ApiBadRequestResponse({ description: 'Invalid date format or range' })
    async getTenantPerformance(
        @Query('startDate') startDate: string,
        @Query('endDate') endDate: string,
        @Query('tenantIds') tenantIds?: string | string[],
        @Req() request: RequestWithTenant,
    ): Promise<TenantPerformanceDto> {
        this.validateDateRange(startDate, endDate);

        const query: AnalyticsQueryDto = {
            dateRange: { startDate, endDate },
            tenantIds: this.parseTenantIds(tenantIds),
        };

        const tenantId = this.getTenantIdForUser(request, query.tenantIds);
        
        return this.analyticsService.getTenantPerformance(query, tenantId);
    }

    @Get('invoice-status')
    @Authorize(RoleName.ADMIN, RoleName.SUPER_ADMIN)
    @ApiOperation({
        summary: 'Get invoice status overview',
        description: 'Retrieves invoice status breakdown and aging analysis',
    })
    @ApiQuery({
        name: 'startDate',
        required: true,
        type: String,
        description: 'Start date in YYYY-MM-DD format',
        example: '2024-01-01',
    })
    @ApiQuery({
        name: 'endDate',
        required: true,
        type: String,
        description: 'End date in YYYY-MM-DD format',
        example: '2024-12-31',
    })
    @ApiQuery({
        name: 'tenantIds',
        required: false,
        type: [String],
        description: 'Tenant IDs to filter by (Super Admin only)',
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Invoice status overview retrieved successfully',
        type: InvoiceStatusOverviewDto,
    })
    @ApiUnauthorizedResponse({ description: 'Unauthorized' })
    @ApiForbiddenResponse({ description: 'Forbidden - requires ADMIN or SUPER_ADMIN role' })
    @ApiBadRequestResponse({ description: 'Invalid date format or range' })
    async getInvoiceStatusOverview(
        @Query('startDate') startDate: string,
        @Query('endDate') endDate: string,
        @Query('tenantIds') tenantIds?: string | string[],
        @Req() request: RequestWithTenant,
    ): Promise<InvoiceStatusOverviewDto> {
        this.validateDateRange(startDate, endDate);

        const query: AnalyticsQueryDto = {
            dateRange: { startDate, endDate },
            tenantIds: this.parseTenantIds(tenantIds),
        };

        const tenantId = this.getTenantIdForUser(request, query.tenantIds);
        
        return this.analyticsService.getInvoiceStatusOverview(query, tenantId);
    }

    @Get('payment-distribution')
    @Authorize(RoleName.ADMIN, RoleName.SUPER_ADMIN)
    @ApiOperation({
        summary: 'Get payment distribution analysis',
        description: 'Retrieves payment method breakdown and timing analysis',
    })
    @ApiQuery({
        name: 'startDate',
        required: true,
        type: String,
        description: 'Start date in YYYY-MM-DD format',
        example: '2024-01-01',
    })
    @ApiQuery({
        name: 'endDate',
        required: true,
        type: String,
        description: 'End date in YYYY-MM-DD format',
        example: '2024-12-31',
    })
    @ApiQuery({
        name: 'tenantIds',
        required: false,
        type: [String],
        description: 'Tenant IDs to filter by (Super Admin only)',
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Payment distribution retrieved successfully',
        type: PaymentDistributionDto,
    })
    @ApiUnauthorizedResponse({ description: 'Unauthorized' })
    @ApiForbiddenResponse({ description: 'Forbidden - requires ADMIN or SUPER_ADMIN role' })
    @ApiBadRequestResponse({ description: 'Invalid date format or range' })
    async getPaymentDistribution(
        @Query('startDate') startDate: string,
        @Query('endDate') endDate: string,
        @Query('tenantIds') tenantIds?: string | string[],
        @Req() request: RequestWithTenant,
    ): Promise<PaymentDistributionDto> {
        this.validateDateRange(startDate, endDate);

        const query: AnalyticsQueryDto = {
            dateRange: { startDate, endDate },
            tenantIds: this.parseTenantIds(tenantIds),
        };

        const tenantId = this.getTenantIdForUser(request, query.tenantIds);
        
        return this.analyticsService.getPaymentDistribution(query, tenantId);
    }

    private validateDateRange(startDate: string, endDate: string): void {
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        
        if (!dateRegex.test(startDate) || !dateRegex.test(endDate)) {
            throw new BadRequestException('Invalid date format. Use YYYY-MM-DD format.');
        }

        const start = new Date(startDate);
        const end = new Date(endDate);

        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
            throw new BadRequestException('Invalid date values.');
        }

        if (start > end) {
            throw new BadRequestException('Start date must be before or equal to end date.');
        }

        // Limit date range to prevent excessive queries
        const maxRangeMs = 365 * 24 * 60 * 60 * 1000; // 1 year
        if (end.getTime() - start.getTime() > maxRangeMs) {
            throw new BadRequestException('Date range cannot exceed 1 year.');
        }
    }

    private parseTenantIds(tenantIds?: string | string[]): string[] | undefined {
        if (!tenantIds) return undefined;
        
        if (Array.isArray(tenantIds)) {
            return tenantIds;
        }
        
        return [tenantIds];
    }

    private getTenantIdForUser(
        request: RequestWithTenant, 
        requestedTenantIds?: string[]
    ): string | undefined {
        // For now, we'll assume the user roles are available in the request
        // In a real implementation, you'd extract roles from JWT or session
        const userRoles = (request as any).userRoles || [];
        const isSuperAdmin = userRoles.includes(RoleName.SUPER_ADMIN);

        if (isSuperAdmin) {
            // Super Admin can filter by specific tenants or see all
            return undefined; // Return undefined to see all tenants
        } else {
            // Regular Admin can only see their tenant data
            return request.tenantId!;
        }
    }
}