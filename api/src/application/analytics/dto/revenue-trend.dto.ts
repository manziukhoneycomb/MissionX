import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsDateString } from 'class-validator';

export class RevenueTrendDto {
    @ApiProperty({
        description: 'Date period for the revenue data',
        example: '2024-01-01',
    })
    @IsDateString()
    period!: string;

    @ApiProperty({
        description: 'Total revenue for the period',
        example: 15750.25,
    })
    @IsNumber()
    totalRevenue!: number;

    @ApiProperty({
        description: 'Number of invoices for the period',
        example: 12,
    })
    @IsNumber()
    invoiceCount!: number;

    @ApiProperty({
        description: 'Average invoice value for the period',
        example: 1312.52,
    })
    @IsNumber()
    averageInvoiceValue!: number;

    @ApiProperty({
        description: 'Period type (monthly, quarterly, yearly)',
        example: 'monthly',
    })
    @IsString()
    periodType!: 'monthly' | 'quarterly' | 'yearly';
}

export class TopCustomerDto {
    @ApiProperty({
        description: 'Customer name',
        example: 'ABC Corporation',
    })
    @IsString()
    customerName!: string;

    @ApiProperty({
        description: 'Total revenue from this customer',
        example: 25000.00,
    })
    @IsNumber()
    totalRevenue!: number;

    @ApiProperty({
        description: 'Number of invoices from this customer',
        example: 8,
    })
    @IsNumber()
    invoiceCount!: number;
}