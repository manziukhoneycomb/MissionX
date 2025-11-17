import { ApiProperty } from '@nestjs/swagger';
import { ValidateNested, IsArray, IsNumber, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { BaseAnalyticsResponseDto } from './analytics-response.dto';

export class TenantPerformanceDto {
    @ApiProperty({
        description: 'Tenant ID',
        example: 'tenant-123',
    })
    @IsString()
    tenantId!: string;

    @ApiProperty({
        description: 'Tenant name',
        example: 'Acme Corporation',
        required: false,
    })
    tenantName?: string;

    @ApiProperty({
        description: 'Total number of invoices for this tenant',
        example: 25,
    })
    @IsNumber()
    invoiceCount!: number;

    @ApiProperty({
        description: 'Total revenue for this tenant',
        example: 50000.75,
    })
    @IsNumber()
    totalRevenue!: number;

    @ApiProperty({
        description: 'Average invoice value for this tenant',
        example: 2000.03,
    })
    @IsNumber()
    avgInvoiceValue!: number;

    @ApiProperty({
        description: 'Number of paid invoices',
        example: 20,
    })
    @IsNumber()
    paidInvoices!: number;

    @ApiProperty({
        description: 'Number of pending invoices',
        example: 3,
    })
    @IsNumber()
    pendingInvoices!: number;

    @ApiProperty({
        description: 'Number of overdue invoices',
        example: 2,
    })
    @IsNumber()
    overdueInvoices!: number;

    @ApiProperty({
        description: 'Payment timeliness percentage (0-100)',
        example: 85.5,
    })
    @IsNumber()
    paymentTimeliness!: number;
}

export class TenantMetricsResponseDto extends BaseAnalyticsResponseDto {
    @ApiProperty({
        description: 'Tenant performance metrics',
        type: [TenantPerformanceDto],
    })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => TenantPerformanceDto)
    tenants!: TenantPerformanceDto[];
}