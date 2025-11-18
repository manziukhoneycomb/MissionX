import { IsNotEmpty, IsString, IsOptional, IsBoolean, IsObject, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateWebhookEventDto {
    @ApiProperty({
        description: 'Type of the event',
        example: 'user.created',
        maxLength: 100,
    })
    @IsNotEmpty()
    @IsString()
    @MaxLength(100)
    eventType: string;

    @ApiProperty({
        description: 'Human-readable description of the event',
        example: 'Triggered when a new user is created',
        maxLength: 255,
    })
    @IsNotEmpty()
    @IsString()
    @MaxLength(255)
    description: string;

    @ApiPropertyOptional({
        description: 'Whether the event type is active',
        example: true,
        default: true,
    })
    @IsOptional()
    @IsBoolean()
    isActive?: boolean = true;

    @ApiPropertyOptional({
        description: 'Category of the event',
        example: 'user',
        maxLength: 50,
    })
    @IsOptional()
    @IsString()
    @MaxLength(50)
    category?: string;

    @ApiPropertyOptional({
        description: 'JSON schema defining the expected payload structure',
        example: {
            type: 'object',
            properties: {
                userId: { type: 'string' },
                email: { type: 'string' }
            }
        },
    })
    @IsOptional()
    @IsObject()
    schema?: Record<string, any>;
}