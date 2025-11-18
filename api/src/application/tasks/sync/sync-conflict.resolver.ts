import { Injectable, Logger } from '@nestjs/common';
import {
    ConflictResolutionContext,
    ConflictResolutionResult,
    ConflictResolution,
    FieldPriorityRule,
    ConflictMergeStrategy,
    MergeStrategy,
    ConflictReviewItem,
    ConflictPriority,
    ConflictReviewStatus,
    ConflictDetectionOptions,
} from './interfaces/conflict.interface';
import { ConflictResolutionPolicy } from './interfaces/sync.interface';

@Injectable()
export class SyncConflictResolver {
    private readonly logger = new Logger(SyncConflictResolver.name);
    private fieldPriorityRules: FieldPriorityRule[] = [];
    private mergeStrategies: ConflictMergeStrategy[] = [];

    constructor() {
        this.initializeDefaultRules();
        this.initializeDefaultMergeStrategies();
    }

    async resolveConflict(context: ConflictResolutionContext): Promise<ConflictResolutionResult> {
        try {
            this.logger.debug(`Resolving conflict for field ${context.field} in task ${context.taskId}`);

            // Check if values are actually different
            if (this.valuesEqual(context.localValue, context.remoteValue, context.field)) {
                return {
                    resolved: true,
                    resolvedValue: context.localValue,
                    resolution: ConflictResolution.USE_LOCAL,
                    requiresManualReview: false,
                };
            }

            // Apply resolution policy
            switch (context.policy) {
                case ConflictResolutionPolicy.LATEST_WINS:
                    return this.resolveLatestWins(context);
                
                case ConflictResolutionPolicy.LOCAL_WINS:
                    return this.resolveLocalWins(context);
                
                case ConflictResolutionPolicy.AZURE_DEVOPS_WINS:
                    return this.resolveRemoteWins(context);
                
                case ConflictResolutionPolicy.FIELD_PRIORITY:
                    return this.resolveFieldPriority(context);
                
                case ConflictResolutionPolicy.MANUAL_REVIEW:
                    return this.requireManualReview(context);
                
                default:
                    this.logger.warn(`Unknown conflict resolution policy: ${context.policy}`);
                    return this.requireManualReview(context);
            }
        } catch (error) {
            this.logger.error('Error resolving conflict:', error);
            return this.requireManualReview(context, 'Error during conflict resolution');
        }
    }

    private resolveLatestWins(context: ConflictResolutionContext): ConflictResolutionResult {
        const localTime = context.localLastModified.getTime();
        const remoteTime = context.remoteLastModified.getTime();

        if (localTime > remoteTime) {
            return {
                resolved: true,
                resolvedValue: context.localValue,
                resolution: ConflictResolution.USE_LOCAL,
                requiresManualReview: false,
                metadata: { reason: 'Local value is more recent' },
            };
        } else {
            return {
                resolved: true,
                resolvedValue: context.remoteValue,
                resolution: ConflictResolution.USE_REMOTE,
                requiresManualReview: false,
                metadata: { reason: 'Remote value is more recent' },
            };
        }
    }

    private resolveLocalWins(context: ConflictResolutionContext): ConflictResolutionResult {
        return {
            resolved: true,
            resolvedValue: context.localValue,
            resolution: ConflictResolution.USE_LOCAL,
            requiresManualReview: false,
            metadata: { reason: 'Local wins policy applied' },
        };
    }

    private resolveRemoteWins(context: ConflictResolutionContext): ConflictResolutionResult {
        return {
            resolved: true,
            resolvedValue: context.remoteValue,
            resolution: ConflictResolution.USE_REMOTE,
            requiresManualReview: false,
            metadata: { reason: 'Remote wins policy applied' },
        };
    }

    private resolveFieldPriority(context: ConflictResolutionContext): ConflictResolutionResult {
        const rule = this.findFieldPriorityRule(context.field);
        
        if (!rule) {
            this.logger.debug(`No priority rule found for field ${context.field}, falling back to latest wins`);
            return this.resolveLatestWins(context);
        }

        // Check if rule has a condition
        if (rule.condition && !rule.condition(context)) {
            return this.resolveLatestWins(context);
        }

        switch (rule.priority) {
            case 'local':
                return this.resolveLocalWins(context);
            case 'remote':
                return this.resolveRemoteWins(context);
            case 'latest':
                return this.resolveLatestWins(context);
            case 'manual':
                return this.requireManualReview(context, `Field ${context.field} requires manual review`);
            default:
                return this.resolveLatestWins(context);
        }
    }

    private requireManualReview(
        context: ConflictResolutionContext,
        reason = 'Manual review required',
    ): ConflictResolutionResult {
        return {
            resolved: false,
            resolvedValue: null,
            resolution: ConflictResolution.MANUAL_REVIEW_REQUIRED,
            requiresManualReview: true,
            metadata: { reason },
        };
    }

    private valuesEqual(local: any, remote: any, field: string): boolean {
        // Handle null/undefined
        if (local == null && remote == null) return true;
        if (local == null || remote == null) return false;

        // Handle different types
        if (typeof local !== typeof remote) return false;

        // Handle dates
        if (local instanceof Date && remote instanceof Date) {
            return Math.abs(local.getTime() - remote.getTime()) < 1000; // 1 second tolerance
        }

        // Handle arrays
        if (Array.isArray(local) && Array.isArray(remote)) {
            if (local.length !== remote.length) return false;
            return local.every((item, index) => this.valuesEqual(item, remote[index], field));
        }

        // Handle objects
        if (typeof local === 'object' && typeof remote === 'object') {
            const localKeys = Object.keys(local).sort();
            const remoteKeys = Object.keys(remote).sort();
            
            if (localKeys.length !== remoteKeys.length) return false;
            if (!localKeys.every((key, index) => key === remoteKeys[index])) return false;
            
            return localKeys.every(key => this.valuesEqual(local[key], remote[key], field));
        }

        // Handle primitives
        return local === remote;
    }

    private findFieldPriorityRule(field: string): FieldPriorityRule | undefined {
        return this.fieldPriorityRules
            .sort((a, b) => (b.weight || 0) - (a.weight || 0))
            .find(rule => rule.field === field || rule.field === '*');
    }

    private initializeDefaultRules(): void {
        this.fieldPriorityRules = [
            {
                field: 'title',
                priority: 'latest',
                weight: 10,
            },
            {
                field: 'status',
                priority: 'remote',
                weight: 9,
                condition: (context) => {
                    // If remote status indicates completion, prefer it
                    const remoteStatus = context.remoteValue;
                    return ['Resolved', 'Closed', 'Done'].includes(remoteStatus);
                },
            },
            {
                field: 'priority',
                priority: 'remote',
                weight: 8,
                condition: (context) => {
                    // Prefer higher priority (lower number in Azure DevOps)
                    return (context.remoteValue as number) < (context.localValue as number);
                },
            },
            {
                field: 'assigneeId',
                priority: 'latest',
                weight: 7,
            },
            {
                field: 'description',
                priority: 'manual',
                weight: 6,
                condition: (context) => {
                    // Require manual review if both values have substantial content
                    const localLength = (context.localValue as string)?.length || 0;
                    const remoteLength = (context.remoteValue as string)?.length || 0;
                    return localLength > 50 && remoteLength > 50;
                },
            },
        ];
    }

    private initializeDefaultMergeStrategies(): void {
        this.mergeStrategies = [
            {
                field: 'metadata',
                strategy: MergeStrategy.UNION,
                customMerger: (local: Record<string, any>, remote: Record<string, any>) => {
                    return { ...local, ...remote };
                },
            },
            {
                field: 'description',
                strategy: MergeStrategy.CONCAT,
                customMerger: (local: string, remote: string) => {
                    if (!local) return remote;
                    if (!remote) return local;
                    return `${local}\n\n--- Azure DevOps Update ---\n${remote}`;
                },
            },
        ];
    }

    async detectConflicts(
        localData: Record<string, any>,
        remoteData: Record<string, any>,
        localLastModified: Date,
        remoteLastModified: Date,
        options: ConflictDetectionOptions = {},
    ): Promise<ConflictResolutionContext[]> {
        const conflicts: ConflictResolutionContext[] = [];
        const fieldsToCheck = options.fields || Object.keys(localData);
        const fieldsToIgnore = new Set(options.ignoreFields || []);
        
        for (const field of fieldsToCheck) {
            if (fieldsToIgnore.has(field)) continue;
            
            const localValue = localData[field];
            const remoteValue = remoteData[field];
            
            // Use custom comparator if provided
            const areEqual = options.valueComparator 
                ? options.valueComparator(localValue, remoteValue, field)
                : this.valuesEqual(localValue, remoteValue, field);
            
            if (!areEqual) {
                conflicts.push({
                    taskId: localData.id,
                    azureDevOpsId: remoteData.id,
                    field,
                    localValue,
                    remoteValue,
                    localLastModified,
                    remoteLastModified,
                    policy: ConflictResolutionPolicy.LATEST_WINS,
                    tenantId: localData.tenantId,
                });
            }
        }
        
        return conflicts;
    }

    addFieldPriorityRule(rule: FieldPriorityRule): void {
        const existingIndex = this.fieldPriorityRules.findIndex(r => r.field === rule.field);
        if (existingIndex >= 0) {
            this.fieldPriorityRules[existingIndex] = rule;
        } else {
            this.fieldPriorityRules.push(rule);
        }
    }

    addMergeStrategy(strategy: ConflictMergeStrategy): void {
        const existingIndex = this.mergeStrategies.findIndex(s => s.field === strategy.field);
        if (existingIndex >= 0) {
            this.mergeStrategies[existingIndex] = strategy;
        } else {
            this.mergeStrategies.push(strategy);
        }
    }

    createConflictReviewItem(
        context: ConflictResolutionContext,
        result: ConflictResolutionResult,
    ): ConflictReviewItem {
        return {
            id: this.generateConflictId(context.taskId, context.azureDevOpsId, context.field),
            taskId: context.taskId,
            azureDevOpsId: context.azureDevOpsId,
            field: context.field,
            localValue: context.localValue,
            remoteValue: context.remoteValue,
            suggestedResolution: result.resolution,
            suggestedValue: result.resolvedValue,
            reason: result.metadata?.reason || 'Conflict detected',
            priority: this.determinePriority(context.field),
            status: ConflictReviewStatus.PENDING,
            createdAt: new Date(),
            tenantId: context.tenantId,
        };
    }

    private generateConflictId(taskId: string, azureDevOpsId: number, field: string): string {
        return `conflict_${taskId}_${azureDevOpsId}_${field}_${Date.now()}`;
    }

    private determinePriority(field: string): ConflictPriority {
        switch (field) {
            case 'title':
            case 'status':
                return ConflictPriority.HIGH;
            case 'priority':
            case 'assigneeId':
                return ConflictPriority.MEDIUM;
            case 'description':
                return ConflictPriority.MEDIUM;
            default:
                return ConflictPriority.LOW;
        }
    }

    getConflictStats(conflicts: ConflictResolutionContext[]): {
        total: number;
        byField: Record<string, number>;
        requiresManualReview: number;
    } {
        const stats = {
            total: conflicts.length,
            byField: {} as Record<string, number>,
            requiresManualReview: 0,
        };

        for (const conflict of conflicts) {
            stats.byField[conflict.field] = (stats.byField[conflict.field] || 0) + 1;
        }

        return stats;
    }
}