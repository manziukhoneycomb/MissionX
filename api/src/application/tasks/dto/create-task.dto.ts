import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsEnum, IsUUID } from 'class-validator';
import { TaskStatus, TaskPriority } from '../../../domain/entities/task.entity';

export class CreateTaskDto {
    @ApiProperty({
        description: 'Title of the task',
        example: 'Implement new feature',
    })
    @IsString()
    title: string;

    @ApiProperty({
        description: 'Detailed description of the task',
        example: 'Implement the new user authentication feature with OAuth',
        required: false,
    })
    @IsOptional()
    @IsString()
    description?: string;

    @ApiProperty({
        description: 'Priority level of the task',
        enum: TaskPriority,
        example: TaskPriority.MEDIUM,
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

export class CreateTaskFromAzureDto {
    @ApiProperty({
        description: 'Title of the task from Azure DevOps',
        example: 'Implement new feature',
    })
    @IsString()
    title: string;

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
        example: TaskStatus.NEW,
    })
    @IsEnum(TaskStatus)
    status: TaskStatus;

    @ApiProperty({
        description: 'Priority level of the task from Azure DevOps',
        enum: TaskPriority,
        example: TaskPriority.MEDIUM,
    })
    @IsEnum(TaskPriority)
    priority: TaskPriority;

    @ApiProperty({
        description: 'Azure DevOps work item ID',
        example: 12345,
    })
    azureDevOpsId: number;

    @ApiProperty({
        description: 'Azure DevOps work item URL',
        example: 'https://dev.azure.com/org/project/_workitems/edit/12345',
    })
    @IsString()
    azureDevOpsUrl: string;

    @ApiProperty({
        description: 'Azure DevOps work item revision number',
        example: 1,
    })
    azureDevOpsRev: number;

    @ApiProperty({
        description: 'ID of the user to assign the task to',
        example: '123e4567-e89b-12d3-a456-426614174000',
        required: false,
    })
    @IsOptional()
    @IsUUID()
    assignedUserId?: string;
}