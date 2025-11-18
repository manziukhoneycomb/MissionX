import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    ManyToOne,
    JoinColumn,
    OneToMany,
    CreateDateColumn,
    UpdateDateColumn,
} from 'typeorm';
import { Tenant } from './tenant.entity';
import { WebhookEvent } from './webhook-event.entity';
import { WebhookLog } from './webhook-log.entity';

@Entity('webhooks')
export class Webhook {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ length: 500 })
    url: string;

    @Column({ length: 10, default: 'POST' })
    method: string;

    @Column('simple-array')
    events: string[];

    @Column({ default: true, name: 'is_active' })
    isActive: boolean;

    @Column({ length: 255, nullable: true })
    secret?: string;

    @Column('simple-json', { nullable: true })
    headers?: Record<string, string>;

    @Column('simple-json', { nullable: true, name: 'retry_policy' })
    retryPolicy?: {
        maxAttempts: number;
        backoffMultiplier: number;
        initialDelayMs: number;
        maxDelayMs: number;
    };

    @Column({ type: 'int', default: 30000 })
    timeout: number;

    @Column({ type: 'int', default: 3, name: 'max_retries' })
    maxRetries: number;

    @Column({ name: 'tenant_id' })
    tenantId: string;

    @ManyToOne(() => Tenant, {
        onDelete: 'CASCADE',
        nullable: false,
    })
    @JoinColumn({ name: 'tenant_id' })
    tenant: Tenant;

    @OneToMany(() => WebhookEvent, (webhookEvent) => webhookEvent.webhook, {
        cascade: true,
    })
    webhookEvents?: WebhookEvent[];

    @OneToMany(() => WebhookLog, (webhookLog) => webhookLog.webhook, {
        cascade: true,
    })
    webhookLogs?: WebhookLog[];

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
}