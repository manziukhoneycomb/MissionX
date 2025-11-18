import { ApiProperty } from '@nestjs/swagger';

export class WebhookDto {
    @ApiProperty({ example: 'uuid-v4', description: 'Unique identifier for the webhook' })
    id: string;

    @ApiProperty({ example: 'https://api.example.com/webhooks', description: 'Webhook endpoint URL' })
    url: string;

    @ApiProperty({ example: 'POST', description: 'HTTP method for webhook calls' })
    method: string;

    @ApiProperty({ 
        example: ['invoice.created', 'invoice.updated', 'invoice.paid'], 
        description: 'Array of event types this webhook subscribes to',
        type: [String]
    })
    events: string[];

    @ApiProperty({ example: true, description: 'Whether the webhook is active' })
    isActive: boolean;

    @ApiProperty({ example: 'webhook-secret-key', description: 'Secret key for webhook verification' })
    secret: string;

    @ApiProperty({ 
        example: { 'Content-Type': 'application/json' }, 
        description: 'Custom headers to send with webhook requests',
        required: false
    })
    headers?: Record<string, string>;

    @ApiProperty({ 
        example: { maxRetries: 3, backoffMultiplier: 2 }, 
        description: 'Retry policy configuration',
        required: false
    })
    retryPolicy?: Record<string, any>;

    @ApiProperty({ example: 30000, description: 'Request timeout in milliseconds' })
    timeout: number;

    @ApiProperty({ example: 3, description: 'Maximum number of retry attempts' })
    maxRetries: number;

    @ApiProperty({ example: 'tenant-uuid', description: 'Tenant ID this webhook belongs to' })
    tenantId: string;

    @ApiProperty({ example: '2023-01-01T00:00:00Z', description: 'Webhook creation timestamp' })
    createdAt: Date;

    @ApiProperty({ example: '2023-01-01T00:00:00Z', description: 'Webhook last update timestamp' })
    updatedAt: Date;
}