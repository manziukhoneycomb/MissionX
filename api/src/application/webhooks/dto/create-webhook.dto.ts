import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { 
    IsUrl, 
    IsNotEmpty, 
    IsArray, 
    IsOptional, 
    IsObject, 
    IsNumber, 
    IsString,
    IsBoolean,
    Min, 
    Max, 
    IsIn, 
    MaxLength,
    ValidateNested 
} from 'class-validator';
import { Type } from 'class-transformer';

export class RetryPolicyDto {
    @ApiProperty({
        description: 'Maximum number of retries',
        example: 3,
        minimum: 1,
        maximum: 10,
    })
    @IsNumber()
    @Min(1)
    @Max(10)
    maxRetries: number;

    @ApiProperty({
        description: 'Retry interval in milliseconds',
        example: 5000,
        minimum: 1000,
        maximum: 300000,
    })
    @IsNumber()
    @Min(1000)
    @Max(300000)
    retryInterval: number;

    @ApiPropertyOptional({
        description: 'Backoff multiplier for exponential backoff',
        example: 2,
        minimum: 1,
        maximum: 5,
    })
    @IsOptional()
    @IsNumber()
    @Min(1)
    @Max(5)
    backoffMultiplier?: number;
}

export class CreateWebhookDto {
    @ApiProperty({
        description: 'Webhook URL endpoint',
        example: 'https://api.example.com/webhooks/events',
        maxLength: 2048,
    })
    @IsNotEmpty()
    @IsUrl()
    @MaxLength(2048)
    url: string;

    @ApiPropertyOptional({
        description: 'HTTP method for webhook calls',
        example: 'POST',
        enum: ['GET', 'POST', 'PUT', 'PATCH'],
        default: 'POST',
    })
    @IsOptional()
    @IsString()
    @IsIn(['GET', 'POST', 'PUT', 'PATCH'])
    method?: string;

    @ApiProperty({
        description: 'Array of event types to subscribe to',
        example: ['user.created', 'user.updated', 'invoice.paid'],
        type: [String],
    })
    @IsArray()
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
        description: 'Secret key for webhook signature verification',
        example: 'webhook_secret_key_123',
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
        description: 'Retry policy configuration',
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