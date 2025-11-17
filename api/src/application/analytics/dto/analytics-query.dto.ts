import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsOptional, IsEnum, IsNumber, Min, Max } from 'class-validator';
import { Transform } from 'class-transformer';

export enum PeriodType {
    DAILY = 'daily',
    WEEKLY = 'weekly',
    MONTHLY = 'monthly',
    QUARTERLY = 'quarterly',
}

export class AnalyticsQueryDto {
    @ApiProperty({
        description: 'Start date for analytics data (ISO date string)',
        example: '2024-01-01',
        required: false,
    })
    @IsOptional()
    @IsDateString()
    startDate?: string;

    @ApiProperty({
        description: 'End date for analytics data (ISO date string)',
        example: '2024-12-31',
        required: false,
    })
    @IsOptional()
    @IsDateString()
    endDate?: string;

    @ApiProperty({
        description: 'Period type for time-based aggregation',
        enum: PeriodType,
        example: PeriodType.MONTHLY,
        required: false,
    })
    @IsOptional()
    @IsEnum(PeriodType)
    period?: PeriodType;

    @ApiProperty({
        description: 'Limit for top results (e.g., top N tenants)',
        example: 10,
        minimum: 1,
        maximum: 100,
        required: false,
    })
    @IsOptional()
    @IsNumber()
    @Transform(({ value }) => parseInt(value))
    @Min(1)
    @Max(100)
    limit?: number;
}