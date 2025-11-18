import { ConflictResolutionPolicy } from './sync.interface';

export interface ConflictResolutionContext {
    taskId: string;
    azureDevOpsId: number;
    field: string;
    localValue: any;
    remoteValue: any;
    localLastModified: Date;
    remoteLastModified: Date;
    policy: ConflictResolutionPolicy;
    tenantId: string;
    userId?: string;
}

export interface ConflictResolutionResult {
    resolved: boolean;
    resolvedValue: any;
    resolution: ConflictResolution;
    requiresManualReview: boolean;
    metadata?: Record<string, any>;
}

export enum ConflictResolution {
    USE_LOCAL = 'use_local',
    USE_REMOTE = 'use_remote',
    USE_MERGED = 'use_merged',
    MANUAL_REVIEW_REQUIRED = 'manual_review_required',
    SKIP_FIELD = 'skip_field',
}

export interface FieldPriorityRule {
    field: string;
    priority: 'local' | 'remote' | 'latest' | 'manual';
    weight?: number;
    condition?: (context: ConflictResolutionContext) => boolean;
}

export interface ConflictMergeStrategy {
    field: string;
    strategy: MergeStrategy;
    customMerger?: (local: any, remote: any, context: ConflictResolutionContext) => any;
}

export enum MergeStrategy {
    CONCAT = 'concat',
    UNION = 'union',
    INTERSECTION = 'intersection',
    PRIORITY_MERGE = 'priority_merge',
    CUSTOM = 'custom',
}

export interface ConflictReviewItem {
    id: string;
    taskId: string;
    azureDevOpsId: number;
    field: string;
    localValue: any;
    remoteValue: any;
    suggestedResolution: ConflictResolution;
    suggestedValue: any;
    reason: string;
    priority: ConflictPriority;
    status: ConflictReviewStatus;
    reviewer?: string;
    reviewedAt?: Date;
    comments?: string;
    createdAt: Date;
    tenantId: string;
}

export enum ConflictPriority {
    LOW = 1,
    MEDIUM = 2,
    HIGH = 3,
    CRITICAL = 4,
}

export enum ConflictReviewStatus {
    PENDING = 'pending',
    IN_REVIEW = 'in_review',
    APPROVED = 'approved',
    REJECTED = 'rejected',
    RESOLVED = 'resolved',
}

export interface ConflictResolutionRule {
    id: string;
    name: string;
    description: string;
    condition: string; // JSON Logic or similar expression
    resolution: ConflictResolution;
    priority: number;
    enabled: boolean;
    createdBy: string;
    createdAt: Date;
    tenantId: string;
}

export interface ConflictDetectionOptions {
    fields?: string[];
    ignoreFields?: string[];
    timestampTolerance?: number; // milliseconds
    valueComparator?: (local: any, remote: any, field: string) => boolean;
}