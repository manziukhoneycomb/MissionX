import { ApiProperty } from '@nestjs/swagger';

export class TenantMetricsDto {
    @ApiProperty({
        description: 'Tenant ID',
        example: '123e4567-e89b-12d3-a456-426614174000',
    })
    tenantId!: string;

    @ApiProperty({
        description: 'Tenant name',
        example: 'Acme Corporation',
    })
    tenantName!: string;

    @ApiProperty({
        description: 'Total number of invoices for this tenant',
        example: 42,
    })
    invoiceCount!: number;

    @ApiProperty({
        description: 'Total revenue from this tenant',
        example: 25000.00,
    })
    totalRevenue!: number;

    @ApiProperty({
        description: 'Average invoice value for this tenant',
        example: 595.24,
    })
    averageInvoiceValue!: number;

    @ApiProperty({
        description: 'Number of overdue invoices for this tenant',
        example: 3,
    })
    overdueCount!: number;

    @ApiProperty({
        description: 'Average payment time in days',
        example: 18.5,
        required: false,
    })
    averagePaymentDays?: number;
}

export class TopCustomerDto {
    @ApiProperty({
        description: 'Customer name',
        example: 'Customer Inc.',
    })
    customerName!: string;

    @ApiProperty({
        description: 'Total revenue from this customer',
        example: 50000.00,
    })
    totalRevenue!: number;

    @ApiProperty({
        description: 'Number of invoices from this customer',
        example: 25,
    })
    invoiceCount!: number;

    @ApiProperty({
        description: 'Average invoice value from this customer',
        example: 2000.00,
    })
    averageInvoiceValue!: number;
}