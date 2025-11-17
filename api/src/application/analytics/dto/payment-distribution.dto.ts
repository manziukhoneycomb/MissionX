import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString, IsDateString } from 'class-validator';

export class PaymentMethodDto {
    @ApiProperty({
        description: 'Payment method name',
        example: 'Credit Card',
    })
    @IsString()
    method!: string;

    @ApiProperty({
        description: 'Number of payments using this method',
        example: 85,
    })
    @IsNumber()
    count!: number;

    @ApiProperty({
        description: 'Total amount paid using this method',
        example: 45000.00,
    })
    @IsNumber()
    totalAmount!: number;

    @ApiProperty({
        description: 'Percentage of total payments',
        example: 42.5,
    })
    @IsNumber()
    percentage!: number;
}

export class PaymentVolumeDto {
    @ApiProperty({
        description: 'Date for the payment volume data',
        example: '2024-01-01',
    })
    @IsDateString()
    date!: string;

    @ApiProperty({
        description: 'Number of payments on this date',
        example: 12,
    })
    @IsNumber()
    paymentCount!: number;

    @ApiProperty({
        description: 'Total payment amount for this date',
        example: 8500.00,
    })
    @IsNumber()
    totalAmount!: number;
}

export class PaymentDistributionDto {
    @ApiProperty({
        description: 'Total number of payments',
        example: 150,
    })
    @IsNumber()
    totalPayments!: number;

    @ApiProperty({
        description: 'Total payment amount',
        example: 125000.00,
    })
    @IsNumber()
    totalAmount!: number;

    @ApiProperty({
        description: 'Average payment amount',
        example: 833.33,
    })
    @IsNumber()
    averagePaymentAmount!: number;

    @ApiProperty({
        description: 'Distribution by payment method',
        type: [PaymentMethodDto],
    })
    byPaymentMethod!: PaymentMethodDto[];

    @ApiProperty({
        description: 'Payment volume over time',
        type: [PaymentVolumeDto],
    })
    paymentVolume!: PaymentVolumeDto[];
}