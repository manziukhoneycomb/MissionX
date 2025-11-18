import { Injectable, Logger } from '@nestjs/common';
import {
    SyncQueueItem,
    SyncOperation,
} from './interfaces/sync.interface';

@Injectable()
export class SyncQueueService {
    private readonly logger = new Logger(SyncQueueService.name);
    private readonly queue: Map<string, SyncQueueItem> = new Map();
    private readonly processing: Set<string> = new Set();
    private isProcessing = false;
    private processingInterval: NodeJS.Timeout | null = null;

    constructor() {
        this.startProcessing();
    }

    async enqueue(
        operation: SyncOperation,
        data: any,
        priority = 1,
        maxAttempts = 3,
    ): Promise<string> {
        const item: SyncQueueItem = {
            id: this.generateQueueId(),
            operation,
            data,
            priority,
            attempts: 0,
            maxAttempts,
            nextAttempt: new Date(),
            createdAt: new Date(),
        };

        this.queue.set(item.id, item);
        this.logger.debug(`Enqueued item ${item.id} with operation ${operation}`);
        
        return item.id;
    }

    async dequeue(): Promise<SyncQueueItem | null> {
        const now = new Date();
        const availableItems = Array.from(this.queue.values())
            .filter(item => 
                !this.processing.has(item.id) && 
                item.nextAttempt <= now &&
                item.attempts < item.maxAttempts
            )
            .sort((a, b) => {
                // Sort by priority (higher first), then by creation date (older first)
                if (a.priority !== b.priority) {
                    return b.priority - a.priority;
                }
                return a.createdAt.getTime() - b.createdAt.getTime();
            });

        if (availableItems.length === 0) {
            return null;
        }

        const item = availableItems[0];
        this.processing.add(item.id);
        item.attempts++;

        return item;
    }

    async complete(itemId: string): Promise<void> {
        const item = this.queue.get(itemId);
        if (item) {
            item.processedAt = new Date();
            this.queue.delete(itemId);
            this.processing.delete(itemId);
            this.logger.debug(`Completed queue item ${itemId}`);
        }
    }

    async fail(itemId: string, error: string): Promise<void> {
        const item = this.queue.get(itemId);
        if (!item) {
            this.logger.warn(`Queue item ${itemId} not found when trying to mark as failed`);
            return;
        }

        item.error = error;
        this.processing.delete(itemId);

        if (item.attempts >= item.maxAttempts) {
            this.logger.error(`Queue item ${itemId} failed permanently after ${item.attempts} attempts: ${error}`);
            this.queue.delete(itemId);
        } else {
            // Calculate exponential backoff
            const backoffMinutes = Math.pow(2, item.attempts - 1) * 5; // 5, 10, 20 minutes
            item.nextAttempt = new Date(Date.now() + backoffMinutes * 60 * 1000);
            this.logger.warn(`Queue item ${itemId} failed (attempt ${item.attempts}/${item.maxAttempts}), retrying at ${item.nextAttempt}: ${error}`);
        }
    }

    getQueueStats(): {
        total: number;
        pending: number;
        processing: number;
        failed: number;
        byOperation: Record<string, number>;
    } {
        const items = Array.from(this.queue.values());
        const now = new Date();

        const stats = {
            total: items.length,
            pending: 0,
            processing: this.processing.size,
            failed: 0,
            byOperation: {} as Record<string, number>,
        };

        for (const item of items) {
            // Count by operation
            stats.byOperation[item.operation] = (stats.byOperation[item.operation] || 0) + 1;

            // Count by status
            if (item.attempts >= item.maxAttempts) {
                stats.failed++;
            } else if (!this.processing.has(item.id) && item.nextAttempt <= now) {
                stats.pending++;
            }
        }

        return stats;
    }

    getQueuedItems(limit = 50, operation?: SyncOperation): SyncQueueItem[] {
        let items = Array.from(this.queue.values());
        
        if (operation) {
            items = items.filter(item => item.operation === operation);
        }

        return items
            .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
            .slice(0, limit);
    }

    async clearQueue(operation?: SyncOperation): Promise<number> {
        let removedCount = 0;
        
        for (const [id, item] of this.queue.entries()) {
            if (!operation || item.operation === operation) {
                if (!this.processing.has(id)) {
                    this.queue.delete(id);
                    removedCount++;
                }
            }
        }

        this.logger.debug(`Cleared ${removedCount} items from queue`);
        return removedCount;
    }

    async retryFailedItems(operation?: SyncOperation): Promise<number> {
        let retriedCount = 0;
        const now = new Date();

        for (const item of this.queue.values()) {
            if ((!operation || item.operation === operation) && 
                item.attempts > 0 && 
                item.attempts < item.maxAttempts) {
                item.nextAttempt = now;
                retriedCount++;
            }
        }

        this.logger.debug(`Retried ${retriedCount} failed items`);
        return retriedCount;
    }

    isPriorityOperation(operation: SyncOperation): boolean {
        return operation === SyncOperation.WEBHOOK_SYNC || operation === SyncOperation.MANUAL_SYNC;
    }

    getEstimatedProcessingTime(): number {
        const pendingItems = Array.from(this.queue.values()).filter(
            item => !this.processing.has(item.id) && item.nextAttempt <= new Date()
        );

        // Estimate 30 seconds per sync operation on average
        return pendingItems.length * 30;
    }

    private generateQueueId(): string {
        return `sync_queue_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    private startProcessing(): void {
        if (this.processingInterval) {
            clearInterval(this.processingInterval);
        }

        // Process queue every 10 seconds
        this.processingInterval = setInterval(() => {
            if (!this.isProcessing) {
                this.processQueue();
            }
        }, 10000);
    }

    private async processQueue(): Promise<void> {
        if (this.isProcessing) return;

        this.isProcessing = true;
        try {
            const item = await this.dequeue();
            if (item) {
                this.logger.debug(`Processing queue item ${item.id} (${item.operation})`);
                // The actual processing will be handled by the sync service
                // This is just the queue management
            }
        } catch (error) {
            this.logger.error('Error processing queue:', error);
        } finally {
            this.isProcessing = false;
        }
    }

    onModuleDestroy(): void {
        if (this.processingInterval) {
            clearInterval(this.processingInterval);
            this.processingInterval = null;
        }
    }
}