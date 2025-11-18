import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class WebhookLogDto {
    @ApiProperty({
        description: 'Unique identifier for the webhook log entry',
        example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    })
    id: string;

    @ApiProperty({
        description: 'ID of the webhook that was triggered',
        example: 'webhook-123',
    })
    webhookId: string;

    @ApiProperty({
        description: 'Type of event that triggered the webhook',
        example: 'user.created',
    })
    eventType: string;

    @ApiProperty({
        description: 'Payload that was sent to the webhook',
        example: {
            eventType: 'user.created',
            data: { userId: '123', email: 'user@example.com' }
        },
    })
    payload: Record<string, any>;

    @ApiProperty({
        description: 'Status of the webhook delivery',
        example: 'success',
        enum: ['pending', 'success', 'failed', 'retrying'],
    })
    status: string;

    @ApiPropertyOptional({
        description: 'HTTP status code from the webhook endpoint response',
        example: 200,
    })
    httpStatusCode?: number;

    @ApiPropertyOptional({
        description: 'Response body from the webhook endpoint',
        example: '{"status":"ok"}',
    })
    response?: string;

    @ApiPropertyOptional({
        description: 'Error message if the webhook delivery failed',
        example: 'Connection timeout',
    })
    error?: string;

    @ApiProperty({
        description: 'Number of delivery attempts made',
        example: 1,
    })
    attempts: number;

    @ApiPropertyOptional({
        description: 'Timestamp for the next retry attempt',
        example: '2023-12-01T10:05:00Z',
    })
    nextRetryAt?: Date;

    @ApiPropertyOptional({
        description: 'Duration of the webhook request in milliseconds',
        example: 250,
    })
    duration?: number;

    @ApiProperty({
        description: 'ID of the tenant that owns this log',
        example: 'tenant-123',
    })
    tenantId: string;

    @ApiProperty({
        description: 'Timestamp when the log entry was created',
        example: '2023-12-01T10:00:00Z',
    })
    createdAt: Date;
}