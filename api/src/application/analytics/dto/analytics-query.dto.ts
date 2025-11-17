import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsDateString, IsEnum, IsString, IsNumber, Min, Max } from 'class-validator';
import { Transform } from 'class-transformer';

export enum PeriodType {
    MONTHLY = 'monthly',
    QUARTERLY = 'quarterly',
    YEARLY = 'yearly',
}

export class AnalyticsQueryDto {
    @ApiProperty({
        description: 'Start date for analytics data (ISO format)',
        example: '2024-01-01',
        required: false,
    })
    @IsOptional()
    @IsDateString()
    startDate?: string;

    @ApiProperty({
        description: 'End date for analytics data (ISO format)',
        example: '2024-12-31',
        required: false,
    })
    @IsOptional()
    @IsDateString()
    endDate?: string;

    @ApiProperty({
        description: 'Period type for revenue trends',
        enum: PeriodType,
        example: PeriodType.MONTHLY,
        required: false,
    })
    @IsOptional()
    @IsEnum(PeriodType)
    periodType?: PeriodType;

    @ApiProperty({
        description: 'Specific tenant ID to filter by (Super Admin only)',
        example: '123e4567-e89b-12d3-a456-426614174000',
        required: false,
    })
    @IsOptional()
    @IsString()
    tenantId?: string;

    @ApiProperty({
        description: 'Limit for top customers/tenants results',
        example: 10,
        required: false,
        minimum: 1,
        maximum: 100,
    })
    @IsOptional()
    @Transform(({ value }) => parseInt(value))
    @IsNumber()
    @Min(1)
    @Max(100)
    limit?: number = 10;
}