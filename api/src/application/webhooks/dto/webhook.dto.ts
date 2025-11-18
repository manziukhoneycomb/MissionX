import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class WebhookDto {
    @ApiProperty({
        description: 'Webhook ID',
        example: '123e4567-e89b-12d3-a456-426614174000',
    })
    id: string;

    @ApiProperty({
        description: 'Webhook URL',
        example: 'https://api.example.com/webhooks',
    })
    url: string;

    @ApiProperty({
        description: 'HTTP method',
        example: 'POST',
        default: 'POST',
    })
    method: string;

    @ApiProperty({
        description: 'Array of event types this webhook subscribes to',
        example: ['user.created', 'invoice.paid'],
        type: [String],
    })
    events: string[];

    @ApiProperty({
        description: 'Whether the webhook is active',
        example: true,
        default: true,
    })
    isActive: boolean;

    @ApiPropertyOptional({
        description: 'Secret for webhook signing',
        example: 'wh_secret_123',
    })
    secret?: string;

    @ApiPropertyOptional({
        description: 'Custom headers to send with webhook requests',
        example: { 'X-API-Key': 'key123', 'Content-Type': 'application/json' },
    })
    headers?: Record<string, string>;

    @ApiPropertyOptional({
        description: 'Retry policy configuration',
        example: {
            maxAttempts: 3,
            backoffMultiplier: 2,
            initialDelayMs: 1000,
            maxDelayMs: 30000,
        },
    })
    retryPolicy?: {
        maxAttempts: number;
        backoffMultiplier: number;
        initialDelayMs: number;
        maxDelayMs: number;
    };

    @ApiProperty({
        description: 'Request timeout in milliseconds',
        example: 30000,
        default: 30000,
    })
    timeout: number;

    @ApiProperty({
        description: 'Maximum number of retries',
        example: 3,
        default: 3,
    })
    maxRetries: number;

    @ApiProperty({
        description: 'Tenant ID this webhook belongs to',
        example: '123e4567-e89b-12d3-a456-426614174000',
    })
    tenantId: string;

    @ApiProperty({
        description: 'Creation timestamp',
        example: '2023-01-01T00:00:00.000Z',
    })
    createdAt: Date;

    @ApiProperty({
        description: 'Last update timestamp',
        example: '2023-01-01T00:00:00.000Z',
    })
    updatedAt: Date;
}