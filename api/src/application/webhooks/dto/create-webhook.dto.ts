import {
    IsNotEmpty,
    IsString,
    IsOptional,
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
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class RetryPolicyDto {
    @ApiProperty({
        description: 'Maximum number of retry attempts',
        example: 3,
        minimum: 1,
        maximum: 10,
    })
    @IsNumber()
    @Min(1)
    @Max(10)
    maxAttempts: number;

    @ApiProperty({
        description: 'Backoff multiplier for exponential backoff',
        example: 2,
        minimum: 1,
        maximum: 10,
    })
    @IsNumber()
    @Min(1)
    @Max(10)
    backoffMultiplier: number;

    @ApiProperty({
        description: 'Initial delay in milliseconds',
        example: 1000,
        minimum: 100,
        maximum: 60000,
    })
    @IsNumber()
    @Min(100)
    @Max(60000)
    initialDelayMs: number;

    @ApiProperty({
        description: 'Maximum delay in milliseconds',
        example: 30000,
        minimum: 1000,
        maximum: 300000,
    })
    @IsNumber()
    @Min(1000)
    @Max(300000)
    maxDelayMs: number;
}

export class CreateWebhookDto {
    @ApiProperty({
        description: 'Webhook endpoint URL',
        example: 'https://api.example.com/webhook',
        maxLength: 500,
    })
    @IsNotEmpty()
    @IsUrl()
    @MaxLength(500)
    url: string;

    @ApiPropertyOptional({
        description: 'HTTP method to use for webhook calls',
        example: 'POST',
        enum: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
        default: 'POST',
    })
    @IsOptional()
    @IsString()
    @IsIn(['GET', 'POST', 'PUT', 'PATCH', 'DELETE'])
    method?: string;

    @ApiProperty({
        description: 'Array of event types this webhook should listen to',
        example: ['user.created', 'invoice.paid', 'tenant.updated'],
        type: [String],
    })
    @IsArray()
    @ArrayNotEmpty()
    @IsString({ each: true })
    @IsNotEmpty({ each: true })
    events: string[];

    @ApiPropertyOptional({
        description: 'Whether the webhook is active',
        example: true,
        default: true,
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
        default: 30000,
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
        default: 3,
    })
    @IsOptional()
    @IsNumber()
    @Min(0)
    @Max(10)
    maxRetries?: number;
}