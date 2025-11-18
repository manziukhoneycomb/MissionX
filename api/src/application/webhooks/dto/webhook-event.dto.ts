import { ApiProperty } from '@nestjs/swagger';

export class WebhookEventDto {
    @ApiProperty({
        description: 'The unique identifier of the webhook event',
        example: '123e4567-e89b-12d3-a456-426614174000',
    })
    id: string;

    @ApiProperty({
        description: 'Event type name',
        example: 'user.created',
    })
    name: string;

    @ApiProperty({
        description: 'Description of the event type',
        example: 'Triggered when a new user is created',
        required: false,
    })
    description?: string;

    @ApiProperty({
        description: 'JSON schema defining the event payload structure',
        required: false,
    })
    schema?: Record<string, any>;

    @ApiProperty({
        description: 'Whether the event type is active',
        example: true,
    })
    isActive: boolean;

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