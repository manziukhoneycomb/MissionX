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
    ApiBadRequestResponse,
} from '@nestjs/swagger';
import { Authorize } from '../../infrastructure/auth/decorators/authorize.decorator';
import { RoleName } from '../../domain/enums/role-name.enum';
import { RequestWithTenant } from '../../infrastructure/middleware/request-with-tenant.interface';
import {
    IAnalyticsService,
    ANALYTICS_SERVICE,
} from '../../application/analytics/interfaces/analytics.service.interface';
import { AnalyticsQueryDto, DateRangeType } from '../../application/analytics/dto/analytics-query.dto';
import { RevenueTrendDto } from '../../application/analytics/dto/revenue-trend.dto';
import { TenantMetricsDto } from '../../application/analytics/dto/tenant-metrics.dto';
import { InvoiceStatusDto } from '../../application/analytics/dto/invoice-status.dto';
import { ComprehensiveAnalyticsDto } from '../../application/analytics/dto/analytics-response.dto';

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
        @Inject(ANALYTICS_SERVICE) private readonly analyticsService: IAnalyticsService,
    ) {}

    private getRequestingUserContext(req: RequestWithTenant): RequestingUserContext {
        const isSuperAdmin: boolean = req.userRoles!.includes(RoleName.SUPER_ADMIN);
        const tenantId: string | undefined = isSuperAdmin ? undefined : req.tenantId!;

        return { isSuperAdmin, tenantId };
    }

    private validateDateRange(query: AnalyticsQueryDto): void {
        if (query.dateRange === DateRangeType.CUSTOM) {
            if (!query.startDate || !query.endDate) {
                throw new BadRequestException(
                    'Start date and end date are required when using custom date range'
                );
            }
            const startDate = new Date(query.startDate);
            const endDate = new Date(query.endDate);
            if (startDate >= endDate) {
                throw new BadRequestException('Start date must be before end date');
            }
        }
    }

    @Get()
    @ApiOperation({
        summary: 'Get comprehensive analytics',
        description: 'Retrieves comprehensive analytics data including all metrics',
    })
    @ApiQuery({
        name: 'dateRange',
        required: false,
        enum: DateRangeType,
        description: 'Predefined date range type',
    })
    @ApiQuery({
        name: 'startDate',
        required: false,
        type: String,
        description: 'Custom start date (ISO format, required if dateRange is CUSTOM)',
    })
    @ApiQuery({
        name: 'endDate',
        required: false,
        type: String,
        description: 'Custom end date (ISO format, required if dateRange is CUSTOM)',
    })
    @ApiQuery({
        name: 'page',
        required: false,
        type: Number,
        description: 'Page number for pagination',
    })
    @ApiQuery({
        name: 'limit',
        required: false,
        type: Number,
        description: 'Number of items per page',
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Comprehensive analytics data retrieved successfully',
        type: ComprehensiveAnalyticsDto,
    })
    @ApiUnauthorizedResponse({ description: 'Unauthorized' })
    @ApiForbiddenResponse({ description: 'Forbidden - requires Admin or Super Admin role' })
    @ApiBadRequestResponse({ description: 'Bad request - invalid date range parameters' })
    async getComprehensiveAnalytics(
        @Query() query: AnalyticsQueryDto,
        @Req() req: RequestWithTenant,
    ): Promise<ComprehensiveAnalyticsDto> {
        this.validateDateRange(query);
        
        const { isSuperAdmin, tenantId } = this.getRequestingUserContext(req);
        
        if (!isSuperAdmin && !tenantId) {
            throw new ForbiddenException('Admin user must belong to a tenant.');
        }

        return this.analyticsService.getComprehensiveAnalytics(query, tenantId, isSuperAdmin);
    }

    @Get('revenue-trend')
    @ApiOperation({
        summary: 'Get revenue trend analytics',
        description: 'Retrieves revenue trend data with time series and top customers',
    })
    @ApiQuery({
        name: 'dateRange',
        required: false,
        enum: DateRangeType,
        description: 'Predefined date range type',
    })
    @ApiQuery({
        name: 'startDate',
        required: false,
        type: String,
        description: 'Custom start date (ISO format, required if dateRange is CUSTOM)',
    })
    @ApiQuery({
        name: 'endDate',
        required: false,
        type: String,
        description: 'Custom end date (ISO format, required if dateRange is CUSTOM)',
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Revenue trend data retrieved successfully',
        type: RevenueTrendDto,
    })
    @ApiUnauthorizedResponse({ description: 'Unauthorized' })
    @ApiForbiddenResponse({ description: 'Forbidden - requires Admin or Super Admin role' })
    @ApiBadRequestResponse({ description: 'Bad request - invalid date range parameters' })
    async getRevenueTrend(
        @Query() query: AnalyticsQueryDto,
        @Req() req: RequestWithTenant,
    ): Promise<RevenueTrendDto> {
        this.validateDateRange(query);
        
        const { isSuperAdmin, tenantId } = this.getRequestingUserContext(req);
        
        if (!isSuperAdmin && !tenantId) {
            throw new ForbiddenException('Admin user must belong to a tenant.');
        }

        return this.analyticsService.getRevenueTrend(query, tenantId, isSuperAdmin);
    }

    @Get('tenant-metrics')
    @ApiOperation({
        summary: 'Get tenant performance metrics',
        description: 'Retrieves tenant performance data and invoice volume trends',
    })
    @ApiQuery({
        name: 'dateRange',
        required: false,
        enum: DateRangeType,
        description: 'Predefined date range type',
    })
    @ApiQuery({
        name: 'startDate',
        required: false,
        type: String,
        description: 'Custom start date (ISO format, required if dateRange is CUSTOM)',
    })
    @ApiQuery({
        name: 'endDate',
        required: false,
        type: String,
        description: 'Custom end date (ISO format, required if dateRange is CUSTOM)',
    })
    @ApiQuery({
        name: 'page',
        required: false,
        type: Number,
        description: 'Page number for pagination',
    })
    @ApiQuery({
        name: 'limit',
        required: false,
        type: Number,
        description: 'Number of items per page',
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Tenant metrics data retrieved successfully',
        type: TenantMetricsDto,
    })
    @ApiUnauthorizedResponse({ description: 'Unauthorized' })
    @ApiForbiddenResponse({ description: 'Forbidden - requires Admin or Super Admin role' })
    @ApiBadRequestResponse({ description: 'Bad request - invalid date range parameters' })
    async getTenantMetrics(
        @Query() query: AnalyticsQueryDto,
        @Req() req: RequestWithTenant,
    ): Promise<TenantMetricsDto> {
        this.validateDateRange(query);
        
        const { isSuperAdmin, tenantId } = this.getRequestingUserContext(req);
        
        if (!isSuperAdmin && !tenantId) {
            throw new ForbiddenException('Admin user must belong to a tenant.');
        }

        return this.analyticsService.getTenantMetrics(query, tenantId, isSuperAdmin);
    }

    @Get('invoice-status')
    @ApiOperation({
        summary: 'Get invoice status overview',
        description: 'Retrieves invoice status breakdown, aging analysis, and overdue invoices',
    })
    @ApiQuery({
        name: 'dateRange',
        required: false,
        enum: DateRangeType,
        description: 'Predefined date range type',
    })
    @ApiQuery({
        name: 'startDate',
        required: false,
        type: String,
        description: 'Custom start date (ISO format, required if dateRange is CUSTOM)',
    })
    @ApiQuery({
        name: 'endDate',
        required: false,
        type: String,
        description: 'Custom end date (ISO format, required if dateRange is CUSTOM)',
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Invoice status data retrieved successfully',
        type: InvoiceStatusDto,
    })
    @ApiUnauthorizedResponse({ description: 'Unauthorized' })
    @ApiForbiddenResponse({ description: 'Forbidden - requires Admin or Super Admin role' })
    @ApiBadRequestResponse({ description: 'Bad request - invalid date range parameters' })
    async getInvoiceStatus(
        @Query() query: AnalyticsQueryDto,
        @Req() req: RequestWithTenant,
    ): Promise<InvoiceStatusDto> {
        this.validateDateRange(query);
        
        const { isSuperAdmin, tenantId } = this.getRequestingUserContext(req);
        
        if (!isSuperAdmin && !tenantId) {
            throw new ForbiddenException('Admin user must belong to a tenant.');
        }

        return this.analyticsService.getInvoiceStatus(query, tenantId, isSuperAdmin);
    }
}