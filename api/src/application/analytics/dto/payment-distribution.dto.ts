import { ApiProperty } from '@nestjs/swagger';

export class PaymentDistributionDto {
    @ApiProperty({
        description: 'Distribution by payment timing',
        type: [PaymentTimingDto],
    })
    byTiming!: PaymentTimingDto[];

    @ApiProperty({
        description: 'Distribution by invoice amount ranges',
        type: [AmountRangeDto],
    })
    byAmountRange!: AmountRangeDto[];

    @ApiProperty({
        description: 'Distribution by customer',
        type: [CustomerDistributionDto],
    })
    byCustomer!: CustomerDistributionDto[];

    @ApiProperty({
        description: 'Distribution by vendor',
        type: [VendorDistributionDto],
    })
    byVendor!: VendorDistributionDto[];
}

export class PaymentTimingDto {
    @ApiProperty({
        description: 'Payment timing category',
        example: 'On Time',
        enum: ['Early', 'On Time', 'Late', 'Very Late'],
    })
    category!: string;

    @ApiProperty({
        description: 'Number of invoices in this category',
        example: 85,
    })
    count!: number;

    @ApiProperty({
        description: 'Total value of invoices in this category',
        example: 42500.00,
    })
    totalValue!: number;

    @ApiProperty({
        description: 'Percentage of total invoices',
        example: 42.5,
    })
    percentage!: number;
}

export class AmountRangeDto {
    @ApiProperty({
        description: 'Amount range (e.g., "$0-$1000", "$1000-$5000")',
        example: '$1000-$5000',
    })
    range!: string;

    @ApiProperty({
        description: 'Number of invoices in this range',
        example: 65,
    })
    count!: number;

    @ApiProperty({
        description: 'Total value of invoices in this range',
        example: 195000.00,
    })
    totalValue!: number;

    @ApiProperty({
        description: 'Percentage of total invoices',
        example: 32.5,
    })
    percentage!: number;
}

export class CustomerDistributionDto {
    @ApiProperty({
        description: 'Customer name',
        example: 'Customer Inc.',
    })
    customerName!: string;

    @ApiProperty({
        description: 'Number of invoices from this customer',
        example: 15,
    })
    invoiceCount!: number;

    @ApiProperty({
        description: 'Total value from this customer',
        example: 30000.00,
    })
    totalValue!: number;

    @ApiProperty({
        description: 'Percentage of total revenue',
        example: 15.0,
    })
    percentage!: number;
}

export class VendorDistributionDto {
    @ApiProperty({
        description: 'Vendor name',
        example: 'Vendor Corp.',
    })
    vendorName!: string;

    @ApiProperty({
        description: 'Number of invoices from this vendor',
        example: 25,
    })
    invoiceCount!: number;

    @ApiProperty({
        description: 'Total value from this vendor',
        example: 75000.00,
    })
    totalValue!: number;

    @ApiProperty({
        description: 'Percentage of total invoices',
        example: 25.0,
    })
    percentage!: number;
}