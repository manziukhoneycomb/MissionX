import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class DateRangeDto {
    @ApiProperty({ description: 'Start date in YYYY-MM-DD format', example: '2024-01-01' })
    @IsNotEmpty()
    startDate!: string;

    @ApiProperty({ description: 'End date in YYYY-MM-DD format', example: '2024-12-31' })
    @IsNotEmpty()
    endDate!: string;
}

export class AnalyticsQueryDto {
    @ApiProperty({ description: 'Date range for analytics', type: DateRangeDto })
    @ValidateNested()
    @Type(() => DateRangeDto)
    dateRange!: DateRangeDto;

    @ApiProperty({ description: 'Tenant IDs to filter by (Super Admin only)', required: false, type: [String] })
    @IsOptional()
    @IsArray()
    tenantIds?: string[];
}

export class MetricSummaryDto {
    @ApiProperty({ description: 'Metric name', example: 'Total Revenue' })
    name!: string;

    @ApiProperty({ description: 'Metric value', example: 125000.50 })
    value!: number;

    @ApiProperty({ description: 'Percentage change from previous period', example: 12.5, required: false })
    @IsOptional()
    changePercent?: number;

    @ApiProperty({ description: 'Value from previous period', example: 111111.11, required: false })
    @IsOptional()
    previousValue?: number;
}