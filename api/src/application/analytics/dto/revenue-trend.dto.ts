import { IsNumber, IsString, IsDate } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RevenueTrendDto {
    @ApiProperty({
        description: 'Date in YYYY-MM-DD format',
        example: '2024-01-01',
    })
    @IsString()
    date!: string;

    @ApiProperty({
        description: 'Total revenue for the date period',
        example: 15000.50,
    })
    @IsNumber()
    revenue!: number;

    @ApiProperty({
        description: 'Number of invoices for the date period',
        example: 25,
    })
    @IsNumber()
    invoiceCount!: number;
}

export class RevenueTrendQueryDto {
    @ApiProperty({
        description: 'Start date for the revenue trend query',
        example: '2024-01-01',
        required: false,
    })
    @IsString()
    startDate?: string;

    @ApiProperty({
        description: 'End date for the revenue trend query',
        example: '2024-12-31',
        required: false,
    })
    @IsString()
    endDate?: string;

    @ApiProperty({
        description: 'Aggregation period: daily, weekly, monthly, quarterly',
        example: 'monthly',
        enum: ['daily', 'weekly', 'monthly', 'quarterly'],
        required: false,
    })
    @IsString()
    period?: 'daily' | 'weekly' | 'monthly' | 'quarterly';
}