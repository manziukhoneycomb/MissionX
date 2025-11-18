import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsDateString, IsEnum, IsNumber, Min, Max } from 'class-validator';
import { Transform } from 'class-transformer';

export enum DateRange {
    LAST_7_DAYS = 'last_7_days',
    LAST_30_DAYS = 'last_30_days',
    LAST_3_MONTHS = 'last_3_months',
    LAST_6_MONTHS = 'last_6_months',
    LAST_YEAR = 'last_year',
    CUSTOM = 'custom',
}

export enum TimeGroup {
    DAY = 'day',
    WEEK = 'week',
    MONTH = 'month',
    QUARTER = 'quarter',
    YEAR = 'year',
}

export class AnalyticsQueryDto {
    @ApiProperty({
        description: 'Start date for the analytics query (ISO format)',
        example: '2024-01-01',
        required: false,
    })
    @IsOptional()
    @IsDateString()
    startDate?: string;

    @ApiProperty({
        description: 'End date for the analytics query (ISO format)',
        example: '2024-12-31',
        required: false,
    })
    @IsOptional()
    @IsDateString()
    endDate?: string;

    @ApiProperty({
        description: 'Predefined date range',
        enum: DateRange,
        required: false,
    })
    @IsOptional()
    @IsEnum(DateRange)
    dateRange?: DateRange;

    @ApiProperty({
        description: 'How to group time-based data',
        enum: TimeGroup,
        required: false,
        default: TimeGroup.MONTH,
    })
    @IsOptional()
    @IsEnum(TimeGroup)
    groupBy?: TimeGroup = TimeGroup.MONTH;

    @ApiProperty({
        description: 'Limit for top results (e.g., top 10 customers)',
        example: 10,
        required: false,
        minimum: 1,
        maximum: 100,
    })
    @IsOptional()
    @IsNumber()
    @Min(1)
    @Max(100)
    @Transform(({ value }) => parseInt(value))
    limit?: number = 10;
}