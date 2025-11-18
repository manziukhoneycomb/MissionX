import { IsNumber, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class PaymentMethodDto {
    @ApiProperty({
        description: 'Payment method name',
        example: 'Credit Card',
    })
    @IsString()
    method!: string;

    @ApiProperty({
        description: 'Number of payments using this method',
        example: 150,
    })
    @IsNumber()
    count!: number;

    @ApiProperty({
        description: 'Total value of payments using this method',
        example: 45000.75,
    })
    @IsNumber()
    totalValue!: number;

    @ApiProperty({
        description: 'Percentage of total payments',
        example: 35.5,
    })
    @IsNumber()
    percentage!: number;
}

export class PaymentTimingDto {
    @ApiProperty({
        description: 'Payment timing category',
        example: 'On Time',
        enum: ['Early', 'On Time', 'Late'],
    })
    @IsString()
    timing!: 'Early' | 'On Time' | 'Late';

    @ApiProperty({
        description: 'Number of payments in this timing category',
        example: 85,
    })
    @IsNumber()
    count!: number;

    @ApiProperty({
        description: 'Total value of payments in this timing category',
        example: 25000.50,
    })
    @IsNumber()
    totalValue!: number;

    @ApiProperty({
        description: 'Percentage of total payments',
        example: 42.5,
    })
    @IsNumber()
    percentage!: number;

    @ApiProperty({
        description: 'Average days from due date (negative for early, positive for late)',
        example: -2.5,
    })
    @IsNumber()
    averageDaysFromDue!: number;
}

export class PaymentAmountRangeDto {
    @ApiProperty({
        description: 'Payment amount range',
        example: '$1,000 - $5,000',
    })
    @IsString()
    range!: string;

    @ApiProperty({
        description: 'Number of payments in this range',
        example: 75,
    })
    @IsNumber()
    count!: number;

    @ApiProperty({
        description: 'Total value of payments in this range',
        example: 225000.00,
    })
    @IsNumber()
    totalValue!: number;

    @ApiProperty({
        description: 'Percentage of total payment value',
        example: 30.0,
    })
    @IsNumber()
    percentage!: number;
}

export class PaymentDistributionDto {
    @ApiProperty({
        description: 'Payment method distribution',
        type: [PaymentMethodDto],
    })
    paymentMethods!: PaymentMethodDto[];

    @ApiProperty({
        description: 'Payment timing analysis',
        type: [PaymentTimingDto],
    })
    paymentTiming!: PaymentTimingDto[];

    @ApiProperty({
        description: 'Payment amount ranges',
        type: [PaymentAmountRangeDto],
    })
    amountRanges!: PaymentAmountRangeDto[];

    @ApiProperty({
        description: 'Total number of payments analyzed',
        example: 350,
    })
    @IsNumber()
    totalPayments!: number;

    @ApiProperty({
        description: 'Total payment value analyzed',
        example: 875000.00,
    })
    @IsNumber()
    totalPaymentValue!: number;
}

export class PaymentDistributionQueryDto {
    @ApiProperty({
        description: 'Start date for payment analysis',
        example: '2024-01-01',
        required: false,
    })
    @IsString()
    startDate?: string;

    @ApiProperty({
        description: 'End date for payment analysis',
        example: '2024-12-31',
        required: false,
    })
    @IsString()
    endDate?: string;

    @ApiProperty({
        description: 'Include payment method breakdown',
        example: true,
        required: false,
    })
    includeMethods?: boolean;

    @ApiProperty({
        description: 'Include payment timing analysis',
        example: true,
        required: false,
    })
    includeTiming?: boolean;

    @ApiProperty({
        description: 'Include amount range distribution',
        example: true,
        required: false,
    })
    includeAmountRanges?: boolean;
}