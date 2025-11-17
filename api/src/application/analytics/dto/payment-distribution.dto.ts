import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber } from 'class-validator';

export class PaymentDistributionDto {
    @ApiProperty({
        description: 'Payment method or category',
        example: 'Credit Card',
    })
    @IsString()
    category!: string;

    @ApiProperty({
        description: 'Total amount for this payment category',
        example: 45600.75,
    })
    @IsNumber()
    totalAmount!: number;

    @ApiProperty({
        description: 'Number of payments in this category',
        example: 23,
    })
    @IsNumber()
    count!: number;

    @ApiProperty({
        description: 'Percentage of total payments',
        example: 36.8,
    })
    @IsNumber()
    percentage!: number;

    @ApiProperty({
        description: 'Average payment amount in this category',
        example: 1982.64,
    })
    @IsNumber()
    averageAmount!: number;
}

export class PaymentVolumeByPeriodDto {
    @ApiProperty({
        description: 'Period (month/quarter/year)',
        example: '2024-01',
    })
    @IsString()
    period!: string;

    @ApiProperty({
        description: 'Total payment volume for the period',
        example: 25750.50,
    })
    @IsNumber()
    volume!: number;

    @ApiProperty({
        description: 'Number of payments in the period',
        example: 14,
    })
    @IsNumber()
    paymentCount!: number;
}