import { ApiProperty } from '@nestjs/swagger';

export class WebhookDto {
    @ApiProperty({
        description: 'The unique identifier of the webhook',
        example: '123e4567-e89b-12d3-a456-426614174000',
    })
    id: string;

    @ApiProperty({
        description: 'Webhook endpoint URL',
        example: 'https://api.example.com/webhooks/events',
    })
    url: string;

    @ApiProperty({
        description: 'HTTP method to use for the webhook',
        example: 'POST',
    })
    method: string;

    @ApiProperty({
        description: 'List of event types this webhook should receive',
        example: ['user.created', 'invoice.updated', 'tenant.deleted'],
        type: [String],
    })
    events: string[];

    @ApiProperty({
        description: 'Whether the webhook is active',
        example: true,
    })
    isActive: boolean;

    @ApiProperty({
        description: 'Custom headers to include in webhook requests',
        example: { 'X-API-Key': 'abc123' },
        required: false,
    })
    headers?: Record<string, string>;

    @ApiProperty({
        description: 'Retry policy configuration',
        required: false,
    })
    retryPolicy?: {
        maxRetries: number;
        backoffType: 'linear' | 'exponential';
        initialDelay: number;
    };

    @ApiProperty({
        description: 'Request timeout in milliseconds',
        example: 30000,
    })
    timeout: number;

    @ApiProperty({
        description: 'Maximum number of retry attempts',
        example: 3,
    })
    maxRetries: number;

    @ApiProperty({
        description: 'Tenant ID',
        example: '123e4567-e89b-12d3-a456-426614174000',
    })
    tenantId: string;

    @ApiProperty({
        description: 'Creation timestamp',
        example: '2023-01-01T00:00:00Z',
    })
    createdAt: Date;

    @ApiProperty({
        description: 'Last update timestamp',
        example: '2023-01-01T00:00:00Z',
    })
    updatedAt: Date;
}