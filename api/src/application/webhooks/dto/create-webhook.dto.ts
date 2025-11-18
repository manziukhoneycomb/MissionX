import {
    IsString,
    IsNotEmpty,
    IsOptional,
    IsArray,
    IsBoolean,
    IsObject,
    IsNumber,
    IsIn,
    MaxLength,
    Min,
    Max,
    IsUrl,
    ValidateNested,
    ArrayNotEmpty,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

class RetryPolicyDto {
    @ApiProperty({
        description: 'Maximum number of retry attempts',
        example: 3,
        minimum: 0,
        maximum: 10,
    })
    @IsNumber()
    @Min(0)
    @Max(10)
    maxRetries: number;

    @ApiProperty({
        description: 'Type of backoff strategy',
        example: 'exponential',
        enum: ['linear', 'exponential'],
    })
    @IsString()
    @IsIn(['linear', 'exponential'])
    backoffType: 'linear' | 'exponential';

    @ApiProperty({
        description: 'Initial delay in milliseconds',
        example: 1000,
        minimum: 100,
        maximum: 60000,
    })
    @IsNumber()
    @Min(100)
    @Max(60000)
    initialDelay: number;
}

export class CreateWebhookDto {
    @ApiProperty({
        description: 'Webhook endpoint URL',
        example: 'https://api.example.com/webhooks/events',
        maxLength: 2048,
    })
    @IsNotEmpty()
    @IsUrl()
    @MaxLength(2048)
    url: string;

    @ApiProperty({
        description: 'HTTP method to use for the webhook',
        example: 'POST',
        enum: ['GET', 'POST', 'PUT', 'PATCH'],
        default: 'POST',
    })
    @IsOptional()
    @IsString()
    @IsIn(['GET', 'POST', 'PUT', 'PATCH'])
    method?: string;

    @ApiProperty({
        description: 'List of event types this webhook should receive',
        example: ['user.created', 'invoice.updated', 'tenant.deleted'],
        type: [String],
    })
    @IsArray()
    @ArrayNotEmpty()
    @IsString({ each: true })
    @IsNotEmpty({ each: true })
    events: string[];

    @ApiProperty({
        description: 'Whether the webhook is active',
        example: true,
        default: true,
    })
    @IsOptional()
    @IsBoolean()
    isActive?: boolean;

    @ApiProperty({
        description: 'Secret key for webhook signature verification',
        example: 'sk_123456789abcdef',
        required: false,
        maxLength: 255,
    })
    @IsOptional()
    @IsString()
    @MaxLength(255)
    secret?: string;

    @ApiProperty({
        description: 'Custom headers to include in webhook requests',
        example: { 'X-API-Key': 'abc123', 'Content-Type': 'application/json' },
        required: false,
    })
    @IsOptional()
    @IsObject()
    headers?: Record<string, string>;

    @ApiProperty({
        description: 'Retry policy configuration',
        required: false,
        type: RetryPolicyDto,
    })
    @IsOptional()
    @ValidateNested()
    @Type(() => RetryPolicyDto)
    retryPolicy?: RetryPolicyDto;

    @ApiProperty({
        description: 'Request timeout in milliseconds',
        example: 30000,
        default: 30000,
        minimum: 1000,
        maximum: 300000,
    })
    @IsOptional()
    @IsNumber()
    @Min(1000)
    @Max(300000)
    timeout?: number;

    @ApiProperty({
        description: 'Maximum number of retry attempts',
        example: 3,
        default: 3,
        minimum: 0,
        maximum: 10,
    })
    @IsOptional()
    @IsNumber()
    @Min(0)
    @Max(10)
    maxRetries?: number;
}