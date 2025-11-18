import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class WebhookEventDto {
    @ApiProperty({
        description: 'Unique identifier for the webhook event',
        example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    })
    id: string;

    @ApiProperty({
        description: 'Type of the event',
        example: 'user.created',
    })
    eventType: string;

    @ApiProperty({
        description: 'Human-readable description of the event',
        example: 'Triggered when a new user is created',
    })
    description: string;

    @ApiProperty({
        description: 'Whether the event type is active',
        example: true,
    })
    isActive: boolean;

    @ApiPropertyOptional({
        description: 'Category of the event',
        example: 'user',
    })
    category?: string;

    @ApiPropertyOptional({
        description: 'JSON schema defining the expected payload structure',
    })
    schema?: Record<string, any>;

    @ApiPropertyOptional({
        description: 'ID of the tenant that owns this event (null for system events)',
        example: 'tenant-123',
    })
    tenantId?: string;

    @ApiProperty({
        description: 'Timestamp when the event was created',
        example: '2023-12-01T10:00:00Z',
    })
    createdAt: Date;

    @ApiProperty({
        description: 'Timestamp when the event was last updated',
        example: '2023-12-01T10:00:00Z',
    })
    updatedAt: Date;
}