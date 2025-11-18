import { ApiProperty } from '@nestjs/swagger';
import { TaskStatus, TaskPriority } from '../../../domain/entities/task.entity';
import { UserDto } from '../../users/dto/user.dto';

export class TaskResponseDto {
    @ApiProperty({
        description: 'Unique identifier for the task',
        example: '123e4567-e89b-12d3-a456-426614174000',
    })
    id: string;

    @ApiProperty({
        description: 'Title of the task',
        example: 'Implement user authentication',
    })
    title: string;

    @ApiProperty({
        description: 'Detailed description of the task',
        example: 'Implement OAuth 2.0 authentication with Azure AD',
        required: false,
    })
    description?: string;

    @ApiProperty({
        description: 'Current status of the task',
        enum: TaskStatus,
    })
    status: TaskStatus;

    @ApiProperty({
        description: 'Priority level of the task',
        enum: TaskPriority,
    })
    priority: TaskPriority;

    @ApiProperty({
        description: 'ID of the assigned user',
        example: '123e4567-e89b-12d3-a456-426614174000',
        required: false,
    })
    assigneeId?: string;

    @ApiProperty({
        description: 'Details of the assigned user',
        type: UserDto,
        required: false,
    })
    assignee?: UserDto;

    @ApiProperty({
        description: 'Project identifier',
        example: 'PROJ-001',
        required: false,
    })
    projectId?: string;

    @ApiProperty({
        description: 'External system identifier (e.g., Azure DevOps work item ID)',
        example: 'ADO-12345',
        required: false,
    })
    externalId?: string;

    @ApiProperty({
        description: 'Tenant ID',
        example: '123e4567-e89b-12d3-a456-426614174000',
    })
    tenantId: string;

    @ApiProperty({
        description: 'Additional metadata for the task',
        example: { 'azure-devops-url': 'https://dev.azure.com/...' },
        required: false,
    })
    metadata?: Record<string, any>;

    @ApiProperty({
        description: 'Date when the task was created',
        example: '2024-01-15T10:30:00.000Z',
    })
    createdAt: Date;

    @ApiProperty({
        description: 'Date when the task was last updated',
        example: '2024-01-15T14:30:00.000Z',
    })
    updatedAt: Date;
}