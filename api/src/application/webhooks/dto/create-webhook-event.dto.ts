import {
    IsString,
    IsNotEmpty,
    IsOptional,
    IsBoolean,
    IsObject,
    MaxLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateWebhookEventDto {
    @ApiProperty({
        description: 'Event type name (e.g., user.created, invoice.updated)',
        example: 'user.created',
        maxLength: 255,
    })
    @IsNotEmpty()
    @IsString()
    @MaxLength(255)
    name: string;

    @ApiProperty({
        description: 'Description of the event type',
        example: 'Triggered when a new user is created',
        required: false,
        maxLength: 1000,
    })
    @IsOptional()
    @IsString()
    @MaxLength(1000)
    description?: string;

    @ApiProperty({
        description: 'JSON schema defining the event payload structure',
        example: {
            type: 'object',
            properties: {
                userId: { type: 'string' },
                email: { type: 'string' },
                tenantId: { type: 'string' }
            }
        },
        required: false,
    })
    @IsOptional()
    @IsObject()
    schema?: Record<string, any>;

    @ApiProperty({
        description: 'Whether the event type is active',
        example: true,
        default: true,
    })
    @IsOptional()
    @IsBoolean()
    isActive?: boolean;
}