import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    ManyToOne,
    JoinColumn,
    CreateDateColumn,
} from 'typeorm';
import { Webhook } from './webhook.entity';

export enum WebhookLogStatus {
    PENDING = 'pending',
    SUCCESS = 'success',
    FAILED = 'failed',
    RETRYING = 'retrying',
}

@Entity('webhook_logs')
export class WebhookLog {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({
        type: 'enum',
        enum: WebhookLogStatus,
        default: WebhookLogStatus.PENDING,
    })
    status: WebhookLogStatus;

    @Column({ length: 100, name: 'event_type' })
    eventType: string;

    @Column('text', { nullable: true })
    payload?: string;

    @Column({ type: 'int', nullable: true, name: 'response_status' })
    responseStatus?: number;

    @Column('text', { nullable: true, name: 'response_body' })
    responseBody?: string;

    @Column('simple-json', { nullable: true, name: 'response_headers' })
    responseHeaders?: Record<string, string>;

    @Column('text', { nullable: true, name: 'error_message' })
    errorMessage?: string;

    @Column({ type: 'int', default: 0, name: 'attempt_count' })
    attemptCount: number;

    @Column({ type: 'timestamp', nullable: true, name: 'next_retry_at' })
    nextRetryAt?: Date;

    @Column({ name: 'webhook_id' })
    webhookId: string;

    @ManyToOne(() => Webhook, (webhook) => webhook.webhookLogs, {
        onDelete: 'CASCADE',
        nullable: false,
    })
    @JoinColumn({ name: 'webhook_id' })
    webhook: Webhook;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;
}