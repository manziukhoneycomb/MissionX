import { ApiProperty } from '@nestjs/swagger';

export class InvoiceItemDto {
    @ApiProperty({
        description: 'The unique identifier of the invoice item',
        example: '123e4567-e89b-12d3-a456-426614174000',
    })
    id!: string;

    @ApiProperty({
        description: 'The invoice this item belongs to',
        example: '123e4567-e89b-12d3-a456-426614174000',
    })
    invoiceId!: string;

    @ApiProperty({
        description: 'Line number of the item on the invoice',
        example: 1,
    })
    lineNumber!: number;

    @ApiProperty({
        description: 'Description of the item',
        example: 'Professional services',
    })
    description!: string;

    @ApiProperty({
        description: 'Quantity of the item',
        example: 2,
    })
    quantity!: number;

    @ApiProperty({
        description: 'Unit price of the item',
        example: 150.5,
    })
    unitPrice!: number;

    @ApiProperty({
        description: 'Total amount for this line item',
        example: 301.0,
    })
    amount!: number;
}
