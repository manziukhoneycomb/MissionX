import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsOptional, IsInt, Min, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class DateRangeDto {
    @ApiProperty({
        description: 'Start date in ISO 8601 format',
        example: '2024-01-01',
    })
    @IsDateString()
    startDate!: string;

    @ApiProperty({
        description: 'End date in ISO 8601 format',
        example: '2024-12-31',
    })
    @IsDateString()
    endDate!: string;
}

export class AnalyticsQueryDto extends DateRangeDto {
    @ApiProperty({
        description: 'Page number for pagination',
        example: 1,
        required: false,
    })
    @IsOptional()
    @IsInt()
    @Min(1)
    @Type(() => Number)
    page?: number;

    @ApiProperty({
        description: 'Number of items per page',
        example: 10,
        required: false,
    })
    @IsOptional()
    @IsInt()
    @Min(1)
    @Type(() => Number)
    limit?: number;
}

export class MetricDataPointDto {
    @ApiProperty({
        description: 'Period identifier (e.g., "2024-01" for monthly data)',
        example: '2024-01',
    })
    period!: string;

    @ApiProperty({
        description: 'Numeric value for the metric',
        example: 15000.50,
    })
    value!: number;

    @ApiProperty({
        description: 'Additional label or description',
        example: 'January 2024',
        required: false,
    })
    @IsOptional()
    label?: string;
}

export class AnalyticsMetaDto {
    @ApiProperty({
        description: 'Total number of records',
        example: 150,
    })
    total!: number;

    @ApiProperty({
        description: 'Date range analyzed',
    })
    @ValidateNested()
    @Type(() => DateRangeDto)
    dateRange!: DateRangeDto;

    @ApiProperty({
        description: 'Timestamp when the analytics were generated',
        example: '2024-01-15T10:30:00Z',
    })
    generatedAt!: string;
}

export class BaseAnalyticsResponseDto {
    @ApiProperty({
        description: 'Data points for the analytics metric',
        type: [MetricDataPointDto],
    })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => MetricDataPointDto)
    data!: MetricDataPointDto[];

    @ApiProperty({
        description: 'Metadata about the analytics response',
    })
    @ValidateNested()
    @Type(() => AnalyticsMetaDto)
    meta!: AnalyticsMetaDto;
}