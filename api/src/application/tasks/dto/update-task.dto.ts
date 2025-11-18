import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsEnum, IsUUID } from 'class-validator';
import { TaskStatus, TaskPriority } from '../../../domain/entities/task.entity';

export class UpdateTaskDto {
    @ApiProperty({
        description: 'Title of the task',
        example: 'Implement new feature',
        required: false,
    })
    @IsOptional()
    @IsString()
    title?: string;

    @ApiProperty({
        description: 'Detailed description of the task',
        example: 'Implement the new user authentication feature with OAuth',
        required: false,
    })
    @IsOptional()
    @IsString()
    description?: string;

    @ApiProperty({
        description: 'Current status of the task',
        enum: TaskStatus,
        example: TaskStatus.ACTIVE,
        required: false,
    })
    @IsOptional()
    @IsEnum(TaskStatus)
    status?: TaskStatus;

    @ApiProperty({
        description: 'Priority level of the task',
        enum: TaskPriority,
        example: TaskPriority.HIGH,
        required: false,
    })
    @IsOptional()
    @IsEnum(TaskPriority)
    priority?: TaskPriority;

    @ApiProperty({
        description: 'ID of the user to assign the task to',
        example: '123e4567-e89b-12d3-a456-426614174000',
        required: false,
    })
    @IsOptional()
    @IsUUID()
    assignedUserId?: string;
}

export class UpdateTaskFromAzureDto {
    @ApiProperty({
        description: 'Title of the task from Azure DevOps',
        example: 'Implement new feature',
        required: false,
    })
    @IsOptional()
    @IsString()
    title?: string;

    @ApiProperty({
        description: 'Detailed description of the task from Azure DevOps',
        example: 'Implement the new user authentication feature with OAuth',
        required: false,
    })
    @IsOptional()
    @IsString()
    description?: string;

    @ApiProperty({
        description: 'Status of the task from Azure DevOps',
        enum: TaskStatus,
        example: TaskStatus.ACTIVE,
        required: false,
    })
    @IsOptional()
    @IsEnum(TaskStatus)
    status?: TaskStatus;

    @ApiProperty({
        description: 'Priority level of the task from Azure DevOps',
        enum: TaskPriority,
        example: TaskPriority.HIGH,
        required: false,
    })
    @IsOptional()
    @IsEnum(TaskPriority)
    priority?: TaskPriority;

    @ApiProperty({
        description: 'Azure DevOps work item revision number',
        example: 2,
        required: false,
    })
    @IsOptional()
    azureDevOpsRev?: number;

    @ApiProperty({
        description: 'ID of the user to assign the task to',
        example: '123e4567-e89b-12d3-a456-426614174000',
        required: false,
    })
    @IsOptional()
    @IsUUID()
    assignedUserId?: string;
}