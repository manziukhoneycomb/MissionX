import { TaskStatus, TaskPriority } from '../../../../domain/entities/task.entity';

export interface SyncConfiguration {
    organization: string;
    project: string;
    workItemType: string;
    syncDirection: SyncDirection;
    fieldMappings: FieldMappingConfig[];
    conflictResolution: ConflictResolutionPolicy;
    filters: SyncFilters;
    webhookSecret: string;
}

export enum SyncDirection {
    ONE_WAY_TO_AZURE = 'one_way_to_azure',
    ONE_WAY_FROM_AZURE = 'one_way_from_azure',
    BI_DIRECTIONAL = 'bi_directional',
}

export interface FieldMappingConfig {
    taskField: string;
    azureDevOpsField: string;
    direction: SyncDirection;
    transformer?: FieldTransformer;
    required?: boolean;
    defaultValue?: any;
}

export interface FieldTransformer {
    toAzureDevOps?: (value: any) => any;
    fromAzureDevOps?: (value: any) => any;
}

export enum ConflictResolutionPolicy {
    LATEST_WINS = 'latest_wins',
    AZURE_DEVOPS_WINS = 'azure_devops_wins',
    LOCAL_WINS = 'local_wins',
    MANUAL_REVIEW = 'manual_review',
    FIELD_PRIORITY = 'field_priority',
}

export interface SyncFilters {
    includeWorkItemTypes?: string[];
    excludeWorkItemTypes?: string[];
    includeStates?: string[];
    excludeStates?: string[];
    areaPath?: string;
    iterationPath?: string;
    assignedToUser?: string;
    tags?: string[];
    lastModifiedAfter?: Date;
}

export interface SyncResult {
    success: boolean;
    operation: SyncOperation;
    itemsProcessed: number;
    itemsCreated: number;
    itemsUpdated: number;
    itemsSkipped: number;
    conflicts: SyncConflict[];
    errors: SyncError[];
    startTime: Date;
    endTime: Date;
    duration: number;
}

export enum SyncOperation {
    FULL_SYNC = 'full_sync',
    INCREMENTAL_SYNC = 'incremental_sync',
    WEBHOOK_SYNC = 'webhook_sync',
    MANUAL_SYNC = 'manual_sync',
}

export interface SyncConflict {
    id: string;
    taskId: string;
    azureDevOpsId: number;
    field: string;
    localValue: any;
    remoteValue: any;
    lastModifiedLocal: Date;
    lastModifiedRemote: Date;
    resolutionPolicy: ConflictResolutionPolicy;
    resolved: boolean;
    resolution?: any;
    createdAt: Date;
}

export interface SyncError {
    id: string;
    operation: string;
    taskId?: string;
    azureDevOpsId?: number;
    error: string;
    stack?: string;
    retryCount: number;
    maxRetries: number;
    nextRetryAt?: Date;
    resolved: boolean;
    createdAt: Date;
}

export interface SyncStatus {
    isRunning: boolean;
    lastSync: Date | null;
    nextSync: Date | null;
    currentOperation: SyncOperation | null;
    progress?: {
        current: number;
        total: number;
        percentage: number;
    };
}

export interface SyncQueueItem {
    id: string;
    operation: SyncOperation;
    priority: number;
    data: any;
    attempts: number;
    maxAttempts: number;
    nextAttempt: Date;
    createdAt: Date;
    processedAt?: Date;
    error?: string;
}

export interface WebhookPayload {
    id: string;
    eventType: string;
    publisherId: string;
    message: {
        text: string;
        html: string;
        markdown: string;
    };
    detailedMessage: {
        text: string;
        html: string;
        markdown: string;
    };
    resource: {
        id: number;
        rev: number;
        fields: Record<string, any>;
        url: string;
        _links: Record<string, any>;
    };
    resourceVersion: string;
    resourceContainers: {
        collection: { id: string };
        account: { id: string };
        project: { id: string };
    };
    createdDate: string;
    subscriptionId: string;
    notificationId: number;
}

export const TASK_STATUS_MAPPING: Record<TaskStatus, string> = {
    [TaskStatus.NEW]: 'New',
    [TaskStatus.ACTIVE]: 'Active',
    [TaskStatus.IN_PROGRESS]: 'Active',
    [TaskStatus.RESOLVED]: 'Resolved',
    [TaskStatus.CLOSED]: 'Closed',
};

export const AZURE_DEVOPS_STATUS_MAPPING: Record<string, TaskStatus> = {
    'New': TaskStatus.NEW,
    'Active': TaskStatus.ACTIVE,
    'In Progress': TaskStatus.IN_PROGRESS,
    'Resolved': TaskStatus.RESOLVED,
    'Closed': TaskStatus.CLOSED,
    'Done': TaskStatus.CLOSED,
    'Committed': TaskStatus.ACTIVE,
    'To Do': TaskStatus.NEW,
};

export const TASK_PRIORITY_MAPPING: Record<TaskPriority, number> = {
    [TaskPriority.LOW]: 4,
    [TaskPriority.MEDIUM]: 3,
    [TaskPriority.HIGH]: 2,
    [TaskPriority.CRITICAL]: 1,
};

export const AZURE_DEVOPS_PRIORITY_MAPPING: Record<number, TaskPriority> = {
    1: TaskPriority.CRITICAL,
    2: TaskPriority.HIGH,
    3: TaskPriority.MEDIUM,
    4: TaskPriority.LOW,
};

export enum SyncEventType {
    SYNC_STARTED = 'sync_started',
    SYNC_COMPLETED = 'sync_completed',
    SYNC_FAILED = 'sync_failed',
    CONFLICT_DETECTED = 'conflict_detected',
    CONFLICT_RESOLVED = 'conflict_resolved',
    ITEM_CREATED = 'item_created',
    ITEM_UPDATED = 'item_updated',
    WEBHOOK_RECEIVED = 'webhook_received',
}

export interface SyncEvent {
    type: SyncEventType;
    timestamp: Date;
    data: any;
    tenantId: string;
    userId?: string;
}