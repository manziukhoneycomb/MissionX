import { ApiProperty } from '@nestjs/swagger';

export class WebhookLogDto {
    @ApiProperty({
        description: 'The unique identifier of the webhook log',
        example: '123e4567-e89b-12d3-a456-426614174000',
    })
    id: string;

    @ApiProperty({
        description: 'Webhook ID that triggered this log',
        example: '123e4567-e89b-12d3-a456-426614174000',
    })
    webhookId: string;

    @ApiProperty({
        description: 'Type of event that triggered the webhook',
        example: 'user.created',
    })
    eventType: string;

    @ApiProperty({
        description: 'Event payload sent to the webhook',
        example: {
            userId: '123e4567-e89b-12d3-a456-426614174000',
            email: 'user@example.com',
            tenantId: '123e4567-e89b-12d3-a456-426614174000'
        },
    })
    payload: Record<string, any>;

    @ApiProperty({
        description: 'HTTP status code received from webhook endpoint',
        example: 200,
    })
    statusCode: number;

    @ApiProperty({
        description: 'Response body from webhook endpoint',
        example: 'OK',
        required: false,
    })
    responseBody?: string;

    @ApiProperty({
        description: 'Error message if the webhook failed',
        example: 'Connection timeout',
        required: false,
    })
    errorMessage?: string;

    @ApiProperty({
        description: 'Number of retry attempts made',
        example: 0,
    })
    retryCount: number;

    @ApiProperty({
        description: 'Whether the webhook delivery was successful',
        example: true,
    })
    isSuccess: boolean;

    @ApiProperty({
        description: 'Response time in milliseconds',
        example: 250,
        required: false,
    })
    responseTime?: number;

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
}