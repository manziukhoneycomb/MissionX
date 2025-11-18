import {
    IsOptional,
    IsString,
    IsEnum,
    IsUUID,
    IsNumber,
    Min,
    Max,
    Transform,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { TaskStatus, TaskPriority } from '../../../domain/entities/task.entity';

export class TaskQueryDto {
    @ApiProperty({
        description: 'Page number for pagination',
        example: 1,
        minimum: 1,
        required: false,
        default: 1,
    })
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(1)
    page?: number = 1;

    @ApiProperty({
        description: 'Number of items per page',
        example: 10,
        minimum: 1,
        maximum: 100,
        required: false,
        default: 10,
    })
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(1)
    @Max(100)
    limit?: number = 10;

    @ApiProperty({
        description: 'Filter by task status',
        enum: TaskStatus,
        required: false,
    })
    @IsOptional()
    @IsEnum(TaskStatus)
    status?: TaskStatus;

    @ApiProperty({
        description: 'Filter by task priority',
        enum: TaskPriority,
        required: false,
    })
    @IsOptional()
    @IsEnum(TaskPriority)
    priority?: TaskPriority;

    @ApiProperty({
        description: 'Filter by assigned user ID',
        example: '123e4567-e89b-12d3-a456-426614174000',
        required: false,
    })
    @IsOptional()
    @IsUUID()
    assigneeId?: string;

    @ApiProperty({
        description: 'Filter by project ID',
        example: 'PROJ-001',
        required: false,
    })
    @IsOptional()
    @IsString()
    projectId?: string;

    @ApiProperty({
        description: 'Search in title and description',
        example: 'authentication',
        required: false,
    })
    @IsOptional()
    @IsString()
    search?: string;

    @ApiProperty({
        description: 'Sort field',
        example: 'createdAt',
        enum: ['title', 'status', 'priority', 'createdAt', 'updatedAt'],
        required: false,
        default: 'createdAt',
    })
    @IsOptional()
    @IsString()
    sortBy?: string = 'createdAt';

    @ApiProperty({
        description: 'Sort order',
        example: 'desc',
        enum: ['asc', 'desc'],
        required: false,
        default: 'desc',
    })
    @IsOptional()
    @IsString()
    @Transform(({ value }) => value?.toLowerCase())
    sortOrder?: 'asc' | 'desc' = 'desc';
}

export class TaskPaginationResponseDto {
    @ApiProperty({
        description: 'List of tasks',
        type: [Object],
    })
    data: any[];

    @ApiProperty({
        description: 'Total number of tasks',
        example: 50,
    })
    total: number;

    @ApiProperty({
        description: 'Current page number',
        example: 1,
    })
    page: number;

    @ApiProperty({
        description: 'Number of items per page',
        example: 10,
    })
    limit: number;

    @ApiProperty({
        description: 'Total number of pages',
        example: 5,
    })
    totalPages: number;
}