import { ApiProperty } from '@nestjs/swagger';

export interface AzureWorkItemWebhookResource {
    id: number;
    rev: number;
    url: string;
    fields: {
        [key: string]: any;
        'System.Id'?: { newValue: number };
        'System.Title'?: { oldValue?: string; newValue: string };
        'System.State'?: { oldValue?: string; newValue: string };
        'System.Priority'?: { oldValue?: number; newValue: number };
        'System.Description'?: { oldValue?: string; newValue: string };
        'System.AssignedTo'?: { 
            oldValue?: { displayName: string; uniqueName: string; id: string };
            newValue?: { displayName: string; uniqueName: string; id: string };
        };
    };
}

export class AzureWorkItemWebhookDto {
    @ApiProperty({
        description: 'Subscription ID from Azure DevOps',
        example: 'subscription-id-123',
    })
    subscriptionId: string;

    @ApiProperty({
        description: 'Notification ID',
        example: 12345,
    })
    notificationId: number;

    @ApiProperty({
        description: 'Event ID',
        example: 'work-item-updated',
    })
    id: string;

    @ApiProperty({
        description: 'Event type',
        example: 'workitem.updated',
    })
    eventType: string;

    @ApiProperty({
        description: 'Publisher ID',
        example: 'tfs',
    })
    publisherId: string;

    @ApiProperty({
        description: 'Message describing the event',
        example: 'Work item #12345 was updated by user@example.com',
    })
    message: {
        text: string;
        html: string;
        markdown: string;
    };

    @ApiProperty({
        description: 'Detailed message',
    })
    detailedMessage: {
        text: string;
        html: string;
        markdown: string;
    };

    @ApiProperty({
        description: 'Resource data',
    })
    resource: AzureWorkItemWebhookResource;

    @ApiProperty({
        description: 'Resource containers',
    })
    resourceContainers: {
        collection: {
            id: string;
            baseUrl: string;
        };
        account: {
            id: string;
            baseUrl: string;
        };
        project: {
            id: string;
            baseUrl: string;
        };
    };

    @ApiProperty({
        description: 'Created date',
        example: '2023-01-01T12:00:00Z',
    })
    createdDate: string;
}

export class WebhookValidationDto {
    @ApiProperty({
        description: 'Validation code from Azure DevOps',
        example: 'validation-code-123',
    })
    validationCode: string;
}