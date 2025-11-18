import { ApiProperty } from '@nestjs/swagger';
import { TaskStatus, TaskPriority } from '../../../domain/entities/task.entity';

export class TaskDto {
    @ApiProperty({
        description: 'Unique identifier of the task',
        example: '123e4567-e89b-12d3-a456-426614174000',
    })
    id: string;

    @ApiProperty({
        description: 'Title of the task',
        example: 'Implement new feature',
    })
    title: string;

    @ApiProperty({
        description: 'Detailed description of the task',
        example: 'Implement the new user authentication feature with OAuth',
        required: false,
    })
    description?: string;

    @ApiProperty({
        description: 'Current status of the task',
        enum: TaskStatus,
        example: TaskStatus.NEW,
    })
    status: TaskStatus;

    @ApiProperty({
        description: 'Priority level of the task',
        enum: TaskPriority,
        example: TaskPriority.MEDIUM,
    })
    priority: TaskPriority;

    @ApiProperty({
        description: 'Azure DevOps work item ID',
        example: 12345,
        required: false,
    })
    azureDevOpsId?: number;

    @ApiProperty({
        description: 'Azure DevOps work item URL',
        example: 'https://dev.azure.com/org/project/_workitems/edit/12345',
        required: false,
    })
    azureDevOpsUrl?: string;

    @ApiProperty({
        description: 'Azure DevOps work item revision number',
        example: 3,
        required: false,
    })
    azureDevOpsRev?: number;

    @ApiProperty({
        description: 'Last synchronization timestamp with Azure DevOps',
        example: '2023-01-01T12:00:00Z',
        required: false,
    })
    lastSyncAt?: Date;

    @ApiProperty({
        description: 'Last synchronization error message',
        example: 'Failed to update work item: Access denied',
        required: false,
    })
    syncError?: string;

    @ApiProperty({
        description: 'ID of the user assigned to the task',
        example: '123e4567-e89b-12d3-a456-426614174000',
        required: false,
    })
    assignedUserId?: string;

    @ApiProperty({
        description: 'User assigned to the task',
        required: false,
    })
    assignedUser?: {
        id: string;
        email: string;
        firstName?: string;
        lastName?: string;
    };

    @ApiProperty({
        description: 'ID of the user who created the task',
        example: '123e4567-e89b-12d3-a456-426614174000',
        required: false,
    })
    createdById?: string;

    @ApiProperty({
        description: 'User who created the task',
        required: false,
    })
    createdBy?: {
        id: string;
        email: string;
        firstName?: string;
        lastName?: string;
    };

    @ApiProperty({
        description: 'Date when the task was created',
        example: '2023-01-01T12:00:00Z',
    })
    createdAt: Date;

    @ApiProperty({
        description: 'Date when the task was last updated',
        example: '2023-01-02T12:00:00Z',
    })
    updatedAt: Date;
}