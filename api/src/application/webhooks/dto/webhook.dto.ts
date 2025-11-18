import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class WebhookDto {
    @ApiProperty({
        description: 'Unique identifier for the webhook',
        example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    })
    id: string;

    @ApiProperty({
        description: 'Webhook endpoint URL',
        example: 'https://api.example.com/webhooks/events',
    })
    url: string;

    @ApiProperty({
        description: 'HTTP method to use for webhook calls',
        example: 'POST',
    })
    method: string;

    @ApiProperty({
        description: 'Array of event types this webhook receives',
        example: ['user.created', 'invoice.paid', 'tenant.updated'],
        type: [String],
    })
    events: string[];

    @ApiProperty({
        description: 'Whether the webhook is active',
        example: true,
    })
    isActive: boolean;

    @ApiPropertyOptional({
        description: 'Custom headers included with webhook requests',
        example: { 'X-Custom-Header': 'value' },
    })
    headers?: Record<string, string>;

    @ApiPropertyOptional({
        description: 'Retry policy configuration',
    })
    retryPolicy?: {
        maxRetries: number;
        backoffStrategy: 'linear' | 'exponential';
        initialDelay: number;
    };

    @ApiProperty({
        description: 'Timeout in milliseconds for webhook requests',
        example: 30000,
    })
    timeout: number;

    @ApiProperty({
        description: 'Maximum number of retry attempts',
        example: 3,
    })
    maxRetries: number;

    @ApiProperty({
        description: 'ID of the tenant that owns this webhook',
        example: 'tenant-123',
    })
    tenantId: string;

    @ApiProperty({
        description: 'Timestamp when the webhook was created',
        example: '2023-12-01T10:00:00Z',
    })
    createdAt: Date;

    @ApiProperty({
        description: 'Timestamp when the webhook was last updated',
        example: '2023-12-01T10:00:00Z',
    })
    updatedAt: Date;
}