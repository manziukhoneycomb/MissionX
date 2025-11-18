import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    ManyToOne,
    JoinColumn,
    CreateDateColumn,
} from 'typeorm';
import { Webhook } from './webhook.entity';
import { Tenant } from './tenant.entity';

@Entity('webhook_logs')
export class WebhookLog {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'event_type', length: 100 })
    eventType: string;

    @Column({ type: 'jsonb' })
    payload: Record<string, any>;

    @Column({ length: 20, default: 'pending' })
    status: string;

    @Column({ name: 'http_status', type: 'integer', nullable: true })
    httpStatus?: number;

    @Column({ type: 'text', nullable: true })
    response?: string;

    @Column({ name: 'error_message', type: 'text', nullable: true })
    errorMessage?: string;

    @Column({ name: 'attempt_count', type: 'integer', default: 0 })
    attemptCount: number;

    @Column({ name: 'max_attempts', type: 'integer', default: 3 })
    maxAttempts: number;

    @Column({ name: 'next_retry_at', type: 'timestamp', nullable: true })
    nextRetryAt?: Date;

    @Column({ name: 'delivered_at', type: 'timestamp', nullable: true })
    deliveredAt?: Date;

    @Column({ name: 'webhook_id' })
    webhookId: string;

    @Column({ name: 'tenant_id' })
    tenantId: string;

    @ManyToOne(() => Webhook, (webhook) => webhook.webhookLogs, {
        onDelete: 'CASCADE',
        nullable: false,
    })
    @JoinColumn({ name: 'webhook_id' })
    webhook: Webhook;

    @ManyToOne(() => Tenant, {
        onDelete: 'CASCADE',
        nullable: false,
    })
    @JoinColumn({ name: 'tenant_id' })
    tenant: Tenant;

    @CreateDateColumn()
    createdAt: Date;
}