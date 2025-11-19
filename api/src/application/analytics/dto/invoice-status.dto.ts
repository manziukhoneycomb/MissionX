import { ApiProperty } from '@nestjs/swagger';

export class InvoiceStatusDto {
    @ApiProperty({
        description: 'Number of paid invoices',
        example: 150,
    })
    paidCount!: number;

    @ApiProperty({
        description: 'Number of unpaid invoices',
        example: 45,
    })
    unpaidCount!: number;

    @ApiProperty({
        description: 'Number of overdue invoices',
        example: 12,
    })
    overdueCount!: number;

    @ApiProperty({
        description: 'Total value of paid invoices',
        example: 125000.50,
    })
    paidAmount!: number;

    @ApiProperty({
        description: 'Total value of unpaid invoices',
        example: 35000.25,
    })
    unpaidAmount!: number;

    @ApiProperty({
        description: 'Total value of overdue invoices',
        example: 8500.00,
    })
    overdueAmount!: number;
}

export class InvoiceAgingDto {
    @ApiProperty({
        description: 'Age range (e.g., "0-30 days", "31-60 days")',
        example: '0-30 days',
    })
    ageRange!: string;

    @ApiProperty({
        description: 'Number of invoices in this age range',
        example: 25,
    })
    count!: number;

    @ApiProperty({
        description: 'Total value of invoices in this age range',
        example: 15000.00,
    })
    totalValue!: number;

    @ApiProperty({
        description: 'Percentage of total outstanding amount',
        example: 35.5,
    })
    percentage!: number;
}