import { ApiProperty } from '@nestjs/swagger';
import { ValidateNested, IsArray, IsNumber, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { BaseAnalyticsResponseDto } from './analytics-response.dto';

export enum InvoiceStatusEnum {
    PAID = 'paid',
    PENDING = 'pending',
    OVERDUE = 'overdue',
}

export class InvoiceStatusCountDto {
    @ApiProperty({
        description: 'Invoice status',
        enum: InvoiceStatusEnum,
        example: InvoiceStatusEnum.PAID,
    })
    @IsString()
    status!: InvoiceStatusEnum;

    @ApiProperty({
        description: 'Number of invoices with this status',
        example: 150,
    })
    @IsNumber()
    count!: number;

    @ApiProperty({
        description: 'Total value of invoices with this status',
        example: 125000.50,
    })
    @IsNumber()
    totalValue!: number;

    @ApiProperty({
        description: 'Percentage of total invoices',
        example: 75.5,
    })
    @IsNumber()
    percentage!: number;
}

export class AgingBucketDto {
    @ApiProperty({
        description: 'Aging bucket label',
        example: '0-30 days',
    })
    @IsString()
    bucket!: string;

    @ApiProperty({
        description: 'Number of invoices in this aging bucket',
        example: 45,
    })
    @IsNumber()
    count!: number;

    @ApiProperty({
        description: 'Total value of invoices in this bucket',
        example: 35000.25,
    })
    @IsNumber()
    totalValue!: number;

    @ApiProperty({
        description: 'Days range for this bucket',
        example: { min: 0, max: 30 },
    })
    daysRange!: {
        min: number;
        max: number | null;
    };
}

export class InvoiceStatusOverviewDto {
    @ApiProperty({
        description: 'Breakdown by invoice status',
        type: [InvoiceStatusCountDto],
    })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => InvoiceStatusCountDto)
    statusBreakdown!: InvoiceStatusCountDto[];

    @ApiProperty({
        description: 'Aging analysis buckets',
        type: [AgingBucketDto],
    })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => AgingBucketDto)
    agingAnalysis!: AgingBucketDto[];

    @ApiProperty({
        description: 'Total number of invoices',
        example: 200,
    })
    @IsNumber()
    totalInvoices!: number;

    @ApiProperty({
        description: 'Total value of all invoices',
        example: 450000.75,
    })
    @IsNumber()
    totalValue!: number;
}

export class InvoiceStatusResponseDto extends BaseAnalyticsResponseDto {
    @ApiProperty({
        description: 'Invoice status overview data',
    })
    @ValidateNested()
    @Type(() => InvoiceStatusOverviewDto)
    overview!: InvoiceStatusOverviewDto;
}