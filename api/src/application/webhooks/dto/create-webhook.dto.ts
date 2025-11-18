import { IsNotEmpty, IsString, IsArray, IsBoolean, IsOptional, IsUrl, IsIn, IsInt, Min, Max, ValidateNested, IsObject } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RetryPolicyDto {
    @ApiProperty({
        description: 'Maximum number of retry attempts',
        example: 3,
        minimum: 0,
        maximum: 10,
    })
    @IsInt()
    @Min(0)
    @Max(10)
    maxRetries: number;

    @ApiProperty({
        description: 'Backoff strategy for retries',
        example: 'exponential',
        enum: ['linear', 'exponential'],
    })
    @IsString()
    @IsIn(['linear', 'exponential'])
    backoffStrategy: 'linear' | 'exponential';

    @ApiProperty({
        description: 'Initial delay in milliseconds before first retry',
        example: 1000,
        minimum: 100,
        maximum: 60000,
    })
    @IsInt()
    @Min(100)
    @Max(60000)
    initialDelay: number;
}

export class CreateWebhookDto {
    @ApiProperty({
        description: 'Webhook endpoint URL',
        example: 'https://api.example.com/webhooks/events',
    })
    @IsNotEmpty()
    @IsUrl()
    url: string;

    @ApiPropertyOptional({
        description: 'HTTP method to use for webhook calls',
        example: 'POST',
        enum: ['POST', 'PUT', 'PATCH'],
        default: 'POST',
    })
    @IsOptional()
    @IsString()
    @IsIn(['POST', 'PUT', 'PATCH'])
    method?: string = 'POST';

    @ApiProperty({
        description: 'Array of event types this webhook should receive',
        example: ['user.created', 'invoice.paid', 'tenant.updated'],
        type: [String],
    })
    @IsNotEmpty()
    @IsArray()
    @IsString({ each: true })
    events: string[];

    @ApiPropertyOptional({
        description: 'Whether the webhook is active',
        example: true,
        default: true,
    })
    @IsOptional()
    @IsBoolean()
    isActive?: boolean = true;

    @ApiPropertyOptional({
        description: 'Secret key for webhook signature verification',
        example: 'webhook_secret_key_123',
        maxLength: 255,
    })
    @IsOptional()
    @IsString()
    secret?: string;

    @ApiPropertyOptional({
        description: 'Custom headers to include with webhook requests',
        example: { 'X-Custom-Header': 'value', 'Authorization': 'Bearer token' },
    })
    @IsOptional()
    @IsObject()
    headers?: Record<string, string>;

    @ApiPropertyOptional({
        description: 'Retry policy configuration',
        type: RetryPolicyDto,
    })
    @IsOptional()
    @ValidateNested()
    @Type(() => RetryPolicyDto)
    retryPolicy?: RetryPolicyDto;

    @ApiPropertyOptional({
        description: 'Timeout in milliseconds for webhook requests',
        example: 30000,
        minimum: 1000,
        maximum: 120000,
        default: 30000,
    })
    @IsOptional()
    @IsInt()
    @Min(1000)
    @Max(120000)
    timeout?: number = 30000;

    @ApiPropertyOptional({
        description: 'Maximum number of retry attempts (deprecated, use retryPolicy)',
        example: 3,
        minimum: 0,
        maximum: 10,
        default: 3,
    })
    @IsOptional()
    @IsInt()
    @Min(0)
    @Max(10)
    maxRetries?: number = 3;
}