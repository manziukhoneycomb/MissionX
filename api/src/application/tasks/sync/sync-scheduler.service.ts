import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { SyncService } from './sync.service';
import { SyncOperation, SyncStatus, SyncResult } from './interfaces/sync.interface';

export interface ScheduleConfig {
    enabled: boolean;
    fullSyncCronExpression: string; // e.g., '0 0 */6 * * *' for every 6 hours
    incrementalSyncCronExpression: string; // e.g., '0 */15 * * * *' for every 15 minutes
    healthCheckCronExpression: string; // e.g., '0 */5 * * * *' for every 5 minutes
    maxConcurrentSyncs: number;
    syncTimeout: number; // milliseconds
    retryFailedSyncs: boolean;
    alertOnFailure: boolean;
}

export interface SyncHealth {
    isHealthy: boolean;
    lastSuccessfulSync: Date | null;
    consecutiveFailures: number;
    lastError: string | null;
    queueStatus: {
        pending: number;
        processing: number;
        failed: number;
    };
}

@Injectable()
export class SyncSchedulerService implements OnModuleInit, OnModuleDestroy {
    private readonly logger = new Logger(SyncSchedulerService.name);
    private fullSyncTimer: NodeJS.Timeout | null = null;
    private incrementalSyncTimer: NodeJS.Timeout | null = null;
    private healthCheckTimer: NodeJS.Timeout | null = null;
    private activeSyncs: Set<string> = new Set();
    private syncHistory: SyncResult[] = [];
    private readonly maxHistorySize = 100;
    private consecutiveFailures = 0;
    private lastSuccessfulSync: Date | null = null;

    constructor(private readonly syncService: SyncService) {}

    onModuleInit(): void {
        const config = this.getScheduleConfig();
        if (config.enabled) {
            this.startScheduledSyncs(config);
            this.logger.log('Sync scheduler started with configuration:', config);
        } else {
            this.logger.log('Sync scheduler is disabled');
        }
    }

    onModuleDestroy(): void {
        this.stopScheduledSyncs();
        this.logger.log('Sync scheduler stopped');
    }

    private getScheduleConfig(): ScheduleConfig {
        return {
            enabled: process.env.SYNC_SCHEDULER_ENABLED !== 'false',
            fullSyncCronExpression: process.env.FULL_SYNC_CRON || '0 0 */6 * * *', // Every 6 hours
            incrementalSyncCronExpression: process.env.INCREMENTAL_SYNC_CRON || '0 */15 * * * *', // Every 15 minutes
            healthCheckCronExpression: process.env.HEALTH_CHECK_CRON || '0 */5 * * * *', // Every 5 minutes
            maxConcurrentSyncs: parseInt(process.env.MAX_CONCURRENT_SYNCS || '3', 10),
            syncTimeout: parseInt(process.env.SYNC_TIMEOUT || '300000', 10), // 5 minutes
            retryFailedSyncs: process.env.RETRY_FAILED_SYNCS !== 'false',
            alertOnFailure: process.env.ALERT_ON_SYNC_FAILURE !== 'false',
        };
    }

    private startScheduledSyncs(config: ScheduleConfig): void {
        // Schedule full sync
        const fullSyncInterval = this.parseCronToInterval(config.fullSyncCronExpression);
        if (fullSyncInterval > 0) {
            this.fullSyncTimer = setInterval(() => {
                this.scheduleFullSync();
            }, fullSyncInterval);
            this.logger.debug(`Full sync scheduled every ${fullSyncInterval}ms`);
        }

        // Schedule incremental sync
        const incrementalSyncInterval = this.parseCronToInterval(config.incrementalSyncCronExpression);
        if (incrementalSyncInterval > 0) {
            this.incrementalSyncTimer = setInterval(() => {
                this.scheduleIncrementalSync();
            }, incrementalSyncInterval);
            this.logger.debug(`Incremental sync scheduled every ${incrementalSyncInterval}ms`);
        }

        // Schedule health check
        const healthCheckInterval = this.parseCronToInterval(config.healthCheckCronExpression);
        if (healthCheckInterval > 0) {
            this.healthCheckTimer = setInterval(() => {
                this.performHealthCheck();
            }, healthCheckInterval);
            this.logger.debug(`Health check scheduled every ${healthCheckInterval}ms`);
        }

        // Run initial health check
        setTimeout(() => this.performHealthCheck(), 5000);
    }

    private stopScheduledSyncs(): void {
        if (this.fullSyncTimer) {
            clearInterval(this.fullSyncTimer);
            this.fullSyncTimer = null;
        }

        if (this.incrementalSyncTimer) {
            clearInterval(this.incrementalSyncTimer);
            this.incrementalSyncTimer = null;
        }

        if (this.healthCheckTimer) {
            clearInterval(this.healthCheckTimer);
            this.healthCheckTimer = null;
        }
    }

    private async scheduleFullSync(): Promise<void> {
        const config = this.getScheduleConfig();
        
        if (this.activeSyncs.size >= config.maxConcurrentSyncs) {
            this.logger.warn('Max concurrent syncs reached, skipping scheduled full sync');
            return;
        }

        if (this.isSyncRunning()) {
            this.logger.debug('Sync already running, skipping scheduled full sync');
            return;
        }

        try {
            this.logger.log('Starting scheduled full sync');
            await this.executeSyncWithTimeout(
                SyncOperation.FULL_SYNC,
                config.syncTimeout,
            );
        } catch (error) {
            this.logger.error('Scheduled full sync failed:', error);
            this.handleSyncFailure(error);
        }
    }

    private async scheduleIncrementalSync(): Promise<void> {
        const config = this.getScheduleConfig();
        
        if (this.activeSyncs.size >= config.maxConcurrentSyncs) {
            this.logger.warn('Max concurrent syncs reached, skipping scheduled incremental sync');
            return;
        }

        if (this.isSyncRunning()) {
            this.logger.debug('Sync already running, skipping scheduled incremental sync');
            return;
        }

        try {
            this.logger.debug('Starting scheduled incremental sync');
            await this.executeSyncWithTimeout(
                SyncOperation.INCREMENTAL_SYNC,
                config.syncTimeout,
            );
        } catch (error) {
            this.logger.error('Scheduled incremental sync failed:', error);
            this.handleSyncFailure(error);
        }
    }

    private async executeSyncWithTimeout(
        operation: SyncOperation,
        timeoutMs: number,
    ): Promise<SyncResult> {
        const syncId = this.generateSyncId();
        this.activeSyncs.add(syncId);

        try {
            const syncPromise = this.performSync(operation);
            const timeoutPromise = new Promise<never>((_, reject) =>
                setTimeout(() => reject(new Error('Sync timeout')), timeoutMs)
            );

            const result = await Promise.race([syncPromise, timeoutPromise]);
            
            this.addToHistory(result);
            
            if (result.success) {
                this.consecutiveFailures = 0;
                this.lastSuccessfulSync = result.endTime;
            } else {
                this.consecutiveFailures++;
            }

            return result;
        } finally {
            this.activeSyncs.delete(syncId);
        }
    }

    private async performSync(operation: SyncOperation): Promise<SyncResult> {
        // For simplicity, we'll use a default tenant ID from environment
        // In a real implementation, you'd need to iterate through all tenants
        const defaultTenantId = process.env.DEFAULT_TENANT_ID || 'default';

        switch (operation) {
            case SyncOperation.FULL_SYNC:
                // Perform bi-directional sync
                const fromAzureResult = await this.syncService.syncFromAzureDevOps(defaultTenantId);
                const toAzureResult = await this.syncService.syncToAzureDevOps(defaultTenantId);
                
                // Combine results
                return this.combineResults([fromAzureResult, toAzureResult], operation);

            case SyncOperation.INCREMENTAL_SYNC:
                // For incremental, only sync from Azure DevOps (assuming webhooks handle local changes)
                return await this.syncService.syncFromAzureDevOps(defaultTenantId);

            default:
                throw new Error(`Unsupported sync operation: ${operation}`);
        }
    }

    private combineResults(results: SyncResult[], operation: SyncOperation): SyncResult {
        const startTime = Math.min(...results.map(r => r.startTime.getTime()));
        const endTime = Math.max(...results.map(r => r.endTime.getTime()));

        return {
            success: results.every(r => r.success),
            operation,
            itemsProcessed: results.reduce((sum, r) => sum + r.itemsProcessed, 0),
            itemsCreated: results.reduce((sum, r) => sum + r.itemsCreated, 0),
            itemsUpdated: results.reduce((sum, r) => sum + r.itemsUpdated, 0),
            itemsSkipped: results.reduce((sum, r) => sum + r.itemsSkipped, 0),
            conflicts: results.flatMap(r => r.conflicts),
            errors: results.flatMap(r => r.errors),
            startTime: new Date(startTime),
            endTime: new Date(endTime),
            duration: endTime - startTime,
        };
    }

    private async performHealthCheck(): Promise<void> {
        try {
            const queueStats = this.syncService.getQueueStats();
            const syncStatus = this.syncService.getSyncStatus();
            
            const health: SyncHealth = {
                isHealthy: this.determineHealthStatus(queueStats, syncStatus),
                lastSuccessfulSync: this.lastSuccessfulSync,
                consecutiveFailures: this.consecutiveFailures,
                lastError: this.getLastError(),
                queueStatus: {
                    pending: queueStats.pending,
                    processing: queueStats.processing,
                    failed: queueStats.failed,
                },
            };

            this.logger.debug('Health check result:', health);

            // Alert if unhealthy
            if (!health.isHealthy && this.getScheduleConfig().alertOnFailure) {
                await this.sendHealthAlert(health);
            }

            // Retry failed syncs if configured
            if (this.getScheduleConfig().retryFailedSyncs && queueStats.failed > 0) {
                this.logger.log(`Retrying ${queueStats.failed} failed sync operations`);
                // This would trigger retry logic in the queue service
            }

        } catch (error) {
            this.logger.error('Health check failed:', error);
        }
    }

    private determineHealthStatus(queueStats: any, syncStatus: SyncStatus): boolean {
        // Consider unhealthy if:
        // - Too many consecutive failures
        // - No successful sync in too long
        // - Too many failed items in queue
        // - Sync has been running too long

        if (this.consecutiveFailures >= 5) {
            return false;
        }

        if (this.lastSuccessfulSync) {
            const hoursSinceLastSuccess = (Date.now() - this.lastSuccessfulSync.getTime()) / (1000 * 60 * 60);
            if (hoursSinceLastSuccess > 12) { // No success in 12 hours
                return false;
            }
        }

        if (queueStats.failed > 50) { // Too many failed items
            return false;
        }

        if (syncStatus.isRunning && syncStatus.lastSync) {
            const syncRunningTime = Date.now() - syncStatus.lastSync.getTime();
            if (syncRunningTime > 30 * 60 * 1000) { // Running for more than 30 minutes
                return false;
            }
        }

        return true;
    }

    private async sendHealthAlert(health: SyncHealth): Promise<void> {
        // In a real implementation, this would send alerts via email, Slack, etc.
        this.logger.error('SYNC HEALTH ALERT: System is unhealthy', health);
        
        // Example: Send to monitoring service, email, etc.
        // await this.notificationService.sendAlert('Sync System Unhealthy', health);
    }

    private isSyncRunning(): boolean {
        const status = this.syncService.getSyncStatus();
        return status.isRunning;
    }

    private handleSyncFailure(error: any): void {
        this.consecutiveFailures++;
        this.logger.error(`Sync failure #${this.consecutiveFailures}:`, error);
    }

    private addToHistory(result: SyncResult): void {
        this.syncHistory.unshift(result);
        if (this.syncHistory.length > this.maxHistorySize) {
            this.syncHistory = this.syncHistory.slice(0, this.maxHistorySize);
        }
    }

    private getLastError(): string | null {
        const lastFailedSync = this.syncHistory.find(sync => !sync.success);
        if (lastFailedSync && lastFailedSync.errors.length > 0) {
            return lastFailedSync.errors[0].error;
        }
        return null;
    }

    private generateSyncId(): string {
        return `sync_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    private parseCronToInterval(cronExpression: string): number {
        // Simplified cron parser for basic intervals
        // In production, use a proper cron library like 'node-cron'
        
        // Handle common patterns
        if (cronExpression === '0 0 */6 * * *') return 6 * 60 * 60 * 1000; // 6 hours
        if (cronExpression === '0 */15 * * * *') return 15 * 60 * 1000; // 15 minutes
        if (cronExpression === '0 */5 * * * *') return 5 * 60 * 1000; // 5 minutes
        if (cronExpression === '0 */30 * * * *') return 30 * 60 * 1000; // 30 minutes
        if (cronExpression === '0 0 */1 * * *') return 60 * 60 * 1000; // 1 hour
        if (cronExpression === '0 */10 * * * *') return 10 * 60 * 1000; // 10 minutes

        // Default to 1 hour if we can't parse
        this.logger.warn(`Could not parse cron expression: ${cronExpression}, defaulting to 1 hour`);
        return 60 * 60 * 1000;
    }

    // Public methods for external control

    async triggerFullSync(): Promise<SyncResult> {
        this.logger.log('Manually triggered full sync');
        return this.executeSyncWithTimeout(
            SyncOperation.FULL_SYNC,
            this.getScheduleConfig().syncTimeout,
        );
    }

    async triggerIncrementalSync(): Promise<SyncResult> {
        this.logger.log('Manually triggered incremental sync');
        return this.executeSyncWithTimeout(
            SyncOperation.INCREMENTAL_SYNC,
            this.getScheduleConfig().syncTimeout,
        );
    }

    getHealth(): SyncHealth {
        const queueStats = this.syncService.getQueueStats();
        const syncStatus = this.syncService.getSyncStatus();
        
        return {
            isHealthy: this.determineHealthStatus(queueStats, syncStatus),
            lastSuccessfulSync: this.lastSuccessfulSync,
            consecutiveFailures: this.consecutiveFailures,
            lastError: this.getLastError(),
            queueStatus: {
                pending: queueStats.pending,
                processing: queueStats.processing,
                failed: queueStats.failed,
            },
        };
    }

    getSyncHistory(limit = 10): SyncResult[] {
        return this.syncHistory.slice(0, limit);
    }

    getScheduleStatus(): {
        enabled: boolean;
        activeSyncs: number;
        nextFullSync: Date | null;
        nextIncrementalSync: Date | null;
    } {
        const config = this.getScheduleConfig();
        return {
            enabled: config.enabled,
            activeSyncs: this.activeSyncs.size,
            nextFullSync: null, // Would calculate based on cron expression
            nextIncrementalSync: null, // Would calculate based on cron expression
        };
    }
}