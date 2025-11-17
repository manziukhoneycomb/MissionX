import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional } from 'class-validator';

export class TenantMetricsDto {
    @ApiProperty({
        description: 'Tenant ID',
        example: '123e4567-e89b-12d3-a456-426614174000',
    })
    @IsString()
    tenantId!: string;

    @ApiProperty({
        description: 'Tenant name',
        example: 'Acme Corp',
    })
    @IsString()
    tenantName!: string;

    @ApiProperty({
        description: 'Total number of invoices for this tenant',
        example: 45,
    })
    @IsNumber()
    totalInvoices!: number;

    @ApiProperty({
        description: 'Total revenue from this tenant',
        example: 67500.25,
    })
    @IsNumber()
    totalRevenue!: number;

    @ApiProperty({
        description: 'Average invoice value for this tenant',
        example: 1500.01,
    })
    @IsNumber()
    averageInvoiceValue!: number;

    @ApiProperty({
        description: 'Number of paid invoices',
        example: 38,
    })
    @IsNumber()
    paidInvoices!: number;

    @ApiProperty({
        description: 'Number of unpaid invoices',
        example: 5,
    })
    @IsNumber()
    unpaidInvoices!: number;

    @ApiProperty({
        description: 'Number of overdue invoices',
        example: 2,
    })
    @IsNumber()
    overdueInvoices!: number;

    @ApiProperty({
        description: 'Average days to payment (based on due date vs today)',
        example: 28.5,
        required: false,
    })
    @IsOptional()
    @IsNumber()
    averageDaysToPayment?: number;

    @ApiProperty({
        description: 'Payment timeliness percentage',
        example: 84.4,
    })
    @IsNumber()
    paymentTimelinessPercentage!: number;
}