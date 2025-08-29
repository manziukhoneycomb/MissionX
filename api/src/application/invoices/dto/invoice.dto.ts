import { ApiProperty } from '@nestjs/swagger';
import { InvoiceItemDto } from './invoice-item.dto';

export class InvoiceDto {
    @ApiProperty({
        description: 'The unique identifier of the invoice',
        example: '123e4567-e89b-12d3-a456-426614174000',
    })
    id!: string;

    @ApiProperty({
        description: 'Invoice number',
        example: 'INV-2023-001',
    })
    invoiceNumber!: string;

    @ApiProperty({
        description: 'Date the invoice was issued',
        example: '2023-01-01',
    })
    issueDate!: string;

    @ApiProperty({
        description: 'Due date for payment',
        example: '2023-01-31',
    })
    dueDate!: string;

    @ApiProperty({
        description: 'Name of the vendor',
        example: 'Acme Corporation',
    })
    vendorName!: string;

    @ApiProperty({
        description: 'Address of the vendor',
        example: '123 Vendor Street, City, Country',
    })
    vendorAddress!: string;

    @ApiProperty({
        description: 'Phone number of the vendor',
        example: '+1-123-456-7890',
    })
    vendorPhone!: string;

    @ApiProperty({
        description: 'Email of the vendor',
        example: 'billing@acmecorp.com',
    })
    vendorEmail!: string;

    @ApiProperty({
        description: 'Name of the customer',
        example: 'Customer Inc.',
    })
    customerName!: string;

    @ApiProperty({
        description: 'Address of the customer',
        example: '456 Customer Avenue, City, Country',
    })
    customerAddress!: string;

    @ApiProperty({
        description: 'Phone number of the customer',
        example: '+1-987-654-3210',
    })
    customerPhone!: string;

    @ApiProperty({
        description: 'Email of the customer',
        example: 'accounts@customer.com',
    })
    customerEmail!: string;

    @ApiProperty({
        description: 'Subtotal amount before taxes and discounts',
        example: 1000.0,
    })
    subtotal!: number;

    @ApiProperty({
        description: 'Discount amount',
        example: 100.0,
    })
    discount!: number;

    @ApiProperty({
        description: 'Tax rate as a decimal',
        example: 0.1,
    })
    taxRate!: number;

    @ApiProperty({
        description: 'Total tax amount',
        example: 90.0,
    })
    taxAmount!: number;

    @ApiProperty({
        description: 'Total amount including taxes and discounts',
        example: 990.0,
    })
    totalAmount!: number;

    @ApiProperty({
        description: 'Line items in the invoice',
        type: [InvoiceItemDto],
    })
    items!: InvoiceItemDto[];

    @ApiProperty({
        description: 'Tenant ID',
        example: '123e4567-e89b-12d3-a456-426614174000',
    })
    tenantId!: string;
}
