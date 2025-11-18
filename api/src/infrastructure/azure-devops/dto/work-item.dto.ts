import { ApiProperty } from '@nestjs/swagger';

export interface AzureWorkItemField {
    [key: string]: any;
    'System.Id'?: number;
    'System.Title'?: string;
    'System.Description'?: string;
    'System.State'?: string;
    'System.Priority'?: number;
    'System.AssignedTo'?: {
        displayName: string;
        uniqueName: string;
        id: string;
    };
    'System.CreatedBy'?: {
        displayName: string;
        uniqueName: string;
        id: string;
    };
    'System.CreatedDate'?: string;
    'System.ChangedDate'?: string;
    'System.Rev'?: number;
}

export class AzureWorkItemDto {
    @ApiProperty({
        description: 'Azure DevOps work item ID',
        example: 12345,
    })
    id: number;

    @ApiProperty({
        description: 'Azure DevOps work item revision',
        example: 3,
    })
    rev: number;

    @ApiProperty({
        description: 'Work item fields containing all the data',
    })
    fields: AzureWorkItemField;

    @ApiProperty({
        description: 'Work item URL',
        example: 'https://dev.azure.com/org/project/_apis/wit/workItems/12345',
    })
    url: string;
}

export class CreateAzureWorkItemDto {
    @ApiProperty({
        description: 'Title of the work item',
        example: 'Implement new feature',
    })
    title: string;

    @ApiProperty({
        description: 'Description of the work item',
        example: 'Implement the new user authentication feature with OAuth',
        required: false,
    })
    description?: string;

    @ApiProperty({
        description: 'Work item type',
        example: 'Task',
        default: 'Task',
    })
    workItemType?: string;

    @ApiProperty({
        description: 'Priority of the work item',
        example: 2,
        required: false,
    })
    priority?: number;

    @ApiProperty({
        description: 'Assigned user email or display name',
        example: 'user@example.com',
        required: false,
    })
    assignedTo?: string;
}

export class UpdateAzureWorkItemDto {
    @ApiProperty({
        description: 'Title of the work item',
        example: 'Implement new feature',
        required: false,
    })
    title?: string;

    @ApiProperty({
        description: 'Description of the work item',
        example: 'Implement the new user authentication feature with OAuth',
        required: false,
    })
    description?: string;

    @ApiProperty({
        description: 'State of the work item',
        example: 'Active',
        required: false,
    })
    state?: string;

    @ApiProperty({
        description: 'Priority of the work item',
        example: 3,
        required: false,
    })
    priority?: number;

    @ApiProperty({
        description: 'Assigned user email or display name',
        example: 'user@example.com',
        required: false,
    })
    assignedTo?: string;
}

export class AzureWorkItemPatchOperation {
    op: 'add' | 'replace' | 'remove';
    path: string;
    value?: any;
    from?: string;
}