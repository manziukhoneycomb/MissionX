import {
    IsOptional,
    IsString,
    IsArray,
    IsBoolean,
    IsObject,
    IsNumber,
    IsIn,
    MaxLength,
    IsUrl,
    Min,
    Max,
    ValidateNested,
    ArrayNotEmpty,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { RetryPolicyDto } from './create-webhook.dto';

export class UpdateWebhookDto {
    @ApiPropertyOptional({
        description: 'Webhook endpoint URL',
        example: 'https://api.example.com/webhook',
        maxLength: 500,
    })
    @IsOptional()
    @IsUrl()
    @MaxLength(500)
    url?: string;

    @ApiPropertyOptional({
        description: 'HTTP method to use for webhook calls',
        example: 'POST',
        enum: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    })
    @IsOptional()
    @IsString()
    @IsIn(['GET', 'POST', 'PUT', 'PATCH', 'DELETE'])
    method?: string;

    @ApiPropertyOptional({
        description: 'Array of event types this webhook should listen to',
        example: ['user.created', 'invoice.paid', 'tenant.updated'],
        type: [String],
    })
    @IsOptional()
    @IsArray()
    @ArrayNotEmpty()
    @IsString({ each: true })
    events?: string[];

    @ApiPropertyOptional({
        description: 'Whether the webhook is active',
        example: true,
    })
    @IsOptional()
    @IsBoolean()
    isActive?: boolean;

    @ApiPropertyOptional({
        description: 'Secret key for webhook signature validation',
        example: 'whsec_1234567890abcdef',
        maxLength: 255,
    })
    @IsOptional()
    @IsString()
    @MaxLength(255)
    secret?: string;

    @ApiPropertyOptional({
        description: 'Custom headers to include in webhook requests',
        example: { 'X-Custom-Header': 'value', 'Authorization': 'Bearer token' },
    })
    @IsOptional()
    @IsObject()
    headers?: Record<string, string>;

    @ApiPropertyOptional({
        description: 'Retry policy configuration for failed webhook deliveries',
        type: RetryPolicyDto,
    })
    @IsOptional()
    @ValidateNested()
    @Type(() => RetryPolicyDto)
    retryPolicy?: RetryPolicyDto;

    @ApiPropertyOptional({
        description: 'Request timeout in milliseconds',
        example: 30000,
        minimum: 1000,
        maximum: 120000,
    })
    @IsOptional()
    @IsNumber()
    @Min(1000)
    @Max(120000)
    timeout?: number;

    @ApiPropertyOptional({
        description: 'Maximum number of retry attempts',
        example: 3,
        minimum: 0,
        maximum: 10,
    })
    @IsOptional()
    @IsNumber()
    @Min(0)
    @Max(10)
    maxRetries?: number;
}