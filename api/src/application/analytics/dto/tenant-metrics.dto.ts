import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsUUID } from 'class-validator';

export class TenantMetricsDto {
    @ApiProperty({
        description: 'Tenant ID',
        example: '123e4567-e89b-12d3-a456-426614174000',
    })
    @IsUUID()
    tenantId!: string;

    @ApiProperty({
        description: 'Tenant name',
        example: 'Acme Corporation',
    })
    @IsString()
    tenantName!: string;

    @ApiProperty({
        description: 'Total number of invoices for this tenant',
        example: 25,
    })
    @IsNumber()
    invoiceCount!: number;

    @ApiProperty({
        description: 'Total revenue from this tenant',
        example: 45000.00,
    })
    @IsNumber()
    totalRevenue!: number;

    @ApiProperty({
        description: 'Average invoice value for this tenant',
        example: 1800.00,
    })
    @IsNumber()
    averageInvoiceValue!: number;

    @ApiProperty({
        description: 'Payment timeliness percentage (0-100)',
        example: 85.5,
    })
    @IsNumber()
    paymentTimeliness!: number;

    @ApiProperty({
        description: 'Number of overdue invoices',
        example: 3,
    })
    @IsNumber()
    overdueCount!: number;
}

export class TopTenantsDto {
    @ApiProperty({
        description: 'Top tenants by revenue',
        type: [TenantMetricsDto],
    })
    topByRevenue!: TenantMetricsDto[];

    @ApiProperty({
        description: 'Top tenants by invoice count',
        type: [TenantMetricsDto],
    })
    topByInvoiceCount!: TenantMetricsDto[];

    @ApiProperty({
        description: 'Tenants with best payment timeliness',
        type: [TenantMetricsDto],
    })
    bestPaymentTimeliness!: TenantMetricsDto[];
}