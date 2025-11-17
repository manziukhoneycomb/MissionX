import { ApiProperty } from '@nestjs/swagger';
import { ValidateNested, IsArray, IsNumber, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { BaseAnalyticsResponseDto } from './analytics-response.dto';

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
        description: 'Total value of payments using this method',
        example: 125000.50,
    })
    @IsNumber()
    totalValue!: number;

    @ApiProperty({
        description: 'Percentage of total payments by count',
        example: 42.5,
    })
    @IsNumber()
    countPercentage!: number;

    @ApiProperty({
        description: 'Percentage of total payment value',
        example: 55.7,
    })
    @IsNumber()
    valuePercentage!: number;
}

export class PaymentVolumeDto {
    @ApiProperty({
        description: 'Payment amount range label',
        example: '$1,000 - $5,000',
    })
    @IsString()
    rangeLabel!: string;

    @ApiProperty({
        description: 'Minimum amount in this range',
        example: 1000,
    })
    @IsNumber()
    minAmount!: number;

    @ApiProperty({
        description: 'Maximum amount in this range (null for unlimited)',
        example: 5000,
        required: false,
    })
    maxAmount!: number | null;

    @ApiProperty({
        description: 'Number of payments in this range',
        example: 35,
    })
    @IsNumber()
    count!: number;

    @ApiProperty({
        description: 'Total value of payments in this range',
        example: 87500.25,
    })
    @IsNumber()
    totalValue!: number;

    @ApiProperty({
        description: 'Percentage of total payments',
        example: 17.5,
    })
    @IsNumber()
    percentage!: number;
}

export class PaymentDistributionOverviewDto {
    @ApiProperty({
        description: 'Distribution by payment method',
        type: [PaymentMethodDto],
    })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => PaymentMethodDto)
    paymentMethods!: PaymentMethodDto[];

    @ApiProperty({
        description: 'Distribution by payment volume ranges',
        type: [PaymentVolumeDto],
    })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => PaymentVolumeDto)
    volumeDistribution!: PaymentVolumeDto[];

    @ApiProperty({
        description: 'Total number of payments',
        example: 200,
    })
    @IsNumber()
    totalPayments!: number;

    @ApiProperty({
        description: 'Total value of all payments',
        example: 450000.75,
    })
    @IsNumber()
    totalValue!: number;

    @ApiProperty({
        description: 'Average payment amount',
        example: 2250.04,
    })
    @IsNumber()
    averagePayment!: number;
}

export class PaymentDistributionResponseDto extends BaseAnalyticsResponseDto {
    @ApiProperty({
        description: 'Payment distribution overview data',
    })
    @ValidateNested()
    @Type(() => PaymentDistributionOverviewDto)
    overview!: PaymentDistributionOverviewDto;
}