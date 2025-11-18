import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { RolesGuard } from '../../infrastructure/auth/guards/roles.guard';
import { Authorize } from '../../infrastructure/auth/decorators/authorize.decorator';
import { RoleName } from '../../domain/enums/role-name.enum';
import { AnalyticsService } from '../../application/analytics/analytics.service';
import { AnalyticsData, AnalyticsQueryParams } from '../../application/analytics/dto/analytics.dto';

@ApiTags('Analytics')
@Controller('analytics')
@ApiBearerAuth()
@UseGuards(RolesGuard)
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get()
  @Authorize([RoleName.ADMIN, RoleName.SUPER_ADMIN])
  @ApiOperation({ 
    summary: 'Get analytics data',
    description: 'Retrieve comprehensive analytics data including revenue metrics, tenant performance, and invoice status overview'
  })
  @ApiQuery({ name: 'startDate', required: false, description: 'Start date for analytics (YYYY-MM-DD)' })
  @ApiQuery({ name: 'endDate', required: false, description: 'End date for analytics (YYYY-MM-DD)' })
  @ApiQuery({ name: 'tenantId', required: false, description: 'Filter by specific tenant ID' })
  @ApiResponse({
    status: 200,
    description: 'Analytics data retrieved successfully',
    type: Object,
  })
  async getAnalytics(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('tenantId') tenantId?: string
  ): Promise<AnalyticsData> {
    const params: AnalyticsQueryParams = {
      startDate,
      endDate,
      tenantId
    };

    return this.analyticsService.getAnalyticsData(params);
  }
}