import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsDateString, IsEnum, IsInt, Min } from 'class-validator';
import { Transform } from 'class-transformer';

export enum DateRangeType {
    LAST_7_DAYS = 'last_7_days',
    LAST_30_DAYS = 'last_30_days',
    LAST_90_DAYS = 'last_90_days',
    LAST_YEAR = 'last_year',
    CUSTOM = 'custom',
}

export class AnalyticsQueryDto {
    @ApiProperty({
        description: 'Predefined date range type',
        enum: DateRangeType,
        required: false,
        default: DateRangeType.LAST_30_DAYS,
    })
    @IsOptional()
    @IsEnum(DateRangeType)
    dateRange?: DateRangeType = DateRangeType.LAST_30_DAYS;

    @ApiProperty({
        description: 'Custom start date (ISO format)',
        example: '2024-01-01',
        required: false,
    })
    @IsOptional()
    @IsDateString()
    startDate?: string;

    @ApiProperty({
        description: 'Custom end date (ISO format)',
        example: '2024-12-31',
        required: false,
    })
    @IsOptional()
    @IsDateString()
    endDate?: string;

    @ApiProperty({
        description: 'Page number for pagination',
        example: 1,
        required: false,
        default: 1,
    })
    @IsOptional()
    @Transform(({ value }) => parseInt(value))
    @IsInt()
    @Min(1)
    page?: number = 1;

    @ApiProperty({
        description: 'Number of items per page',
        example: 20,
        required: false,
        default: 20,
    })
    @IsOptional()
    @Transform(({ value }) => parseInt(value))
    @IsInt()
    @Min(1)
    limit?: number = 20;
}