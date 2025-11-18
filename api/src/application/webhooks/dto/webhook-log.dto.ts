import { ApiProperty } from '@nestjs/swagger';

export class WebhookLogDto {
    @ApiProperty({ example: 'uuid-v4', description: 'Unique identifier for the webhook log entry' })
    id: string;

    @ApiProperty({ example: 'uuid-v4', description: 'ID of the webhook this log belongs to' })
    webhookId: string;

    @ApiProperty({ example: 'invoice.created', description: 'Event type that triggered this webhook' })
    eventType: string;

    @ApiProperty({ 
        example: { invoiceId: 'inv-123', status: 'created' }, 
        description: 'Payload sent to the webhook'
    })
    payload: Record<string, any>;

    @ApiProperty({ example: 'success', description: 'Delivery status: success, failed, pending' })
    status: string;

    @ApiProperty({ example: 200, description: 'HTTP response status code', required: false })
    httpStatus?: number;

    @ApiProperty({ 
        example: 'Response body', 
        description: 'Response body from webhook endpoint',
        required: false
    })
    response?: string;

    @ApiProperty({ 
        example: 'Connection timeout', 
        description: 'Error message if delivery failed',
        required: false
    })
    errorMessage?: string;

    @ApiProperty({ example: 1, description: 'Number of delivery attempts' })
    attemptCount: number;

    @ApiProperty({ example: 3, description: 'Maximum number of attempts allowed' })
    maxAttempts: number;

    @ApiProperty({ 
        example: '2023-01-01T00:00:00Z', 
        description: 'When the next retry will be attempted',
        required: false
    })
    nextRetryAt?: Date;

    @ApiProperty({ 
        example: '2023-01-01T00:00:00Z', 
        description: 'When the webhook was successfully delivered',
        required: false
    })
    deliveredAt?: Date;

    @ApiProperty({ example: 'tenant-uuid', description: 'Tenant ID this log belongs to' })
    tenantId: string;

    @ApiProperty({ example: '2023-01-01T00:00:00Z', description: 'When the webhook was triggered' })
    createdAt: Date;
}