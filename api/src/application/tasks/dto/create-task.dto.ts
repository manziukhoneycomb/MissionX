import {
    IsNotEmpty,
    IsOptional,
    IsString,
    IsEnum,
    IsUUID,
    MaxLength,
    IsObject,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { TaskStatus, TaskPriority } from '../../../domain/entities/task.entity';

export class CreateTaskDto {
    @ApiProperty({
        description: 'Title of the task',
        example: 'Implement user authentication',
        maxLength: 255,
    })
    @IsNotEmpty()
    @IsString()
    @MaxLength(255)
    title: string;

    @ApiProperty({
        description: 'Detailed description of the task',
        example: 'Implement OAuth 2.0 authentication with Azure AD',
        required: false,
    })
    @IsOptional()
    @IsString()
    description?: string;

    @ApiProperty({
        description: 'Status of the task',
        enum: TaskStatus,
        default: TaskStatus.NEW,
        required: false,
    })
    @IsOptional()
    @IsEnum(TaskStatus)
    status?: TaskStatus;

    @ApiProperty({
        description: 'Priority level of the task',
        enum: TaskPriority,
        default: TaskPriority.MEDIUM,
        required: false,
    })
    @IsOptional()
    @IsEnum(TaskPriority)
    priority?: TaskPriority;

    @ApiProperty({
        description: 'ID of the assigned user',
        example: '123e4567-e89b-12d3-a456-426614174000',
        required: false,
    })
    @IsOptional()
    @IsUUID()
    assigneeId?: string;

    @ApiProperty({
        description: 'Project identifier',
        example: 'PROJ-001',
        required: false,
        maxLength: 255,
    })
    @IsOptional()
    @IsString()
    @MaxLength(255)
    projectId?: string;

    @ApiProperty({
        description: 'External system identifier (e.g., Azure DevOps work item ID)',
        example: 'ADO-12345',
        required: false,
        maxLength: 255,
    })
    @IsOptional()
    @IsString()
    @MaxLength(255)
    externalId?: string;

    @ApiProperty({
        description: 'Additional metadata for the task',
        example: { 'azure-devops-url': 'https://dev.azure.com/...' },
        required: false,
    })
    @IsOptional()
    @IsObject()
    metadata?: Record<string, any>;
}