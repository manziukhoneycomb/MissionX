import { ApiProperty } from '@nestjs/swagger';
import { ValidateNested, IsArray, IsNumber, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { BaseAnalyticsResponseDto, MetricDataPointDto } from './analytics-response.dto';

export class RevenueDataPointDto extends MetricDataPointDto {
    @ApiProperty({
        description: 'Total revenue for the period',
        example: 25000.75,
    })
    @IsNumber()
    revenue!: number;

    @ApiProperty({
        description: 'Number of invoices in the period',
        example: 15,
    })
    @IsNumber()
    invoiceCount!: number;

    @ApiProperty({
        description: 'Average invoice value for the period',
        example: 1666.72,
    })
    @IsNumber()
    avgInvoiceValue!: number;
}

export class RevenueTrendResponseDto extends BaseAnalyticsResponseDto {
    @ApiProperty({
        description: 'Revenue data points over time',
        type: [RevenueDataPointDto],
    })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => RevenueDataPointDto)
    override data!: RevenueDataPointDto[];
}

export class TopCustomerDto {
    @ApiProperty({
        description: 'Customer name',
        example: 'Acme Corporation',
    })
    @IsString()
    customerName!: string;

    @ApiProperty({
        description: 'Total revenue from this customer',
        example: 12500.50,
    })
    @IsNumber()
    totalRevenue!: number;

    @ApiProperty({
        description: 'Number of invoices for this customer',
        example: 8,
    })
    @IsNumber()
    invoiceCount!: number;

    @ApiProperty({
        description: 'Percentage of total revenue',
        example: 25.5,
    })
    @IsNumber()
    revenuePercentage!: number;
}