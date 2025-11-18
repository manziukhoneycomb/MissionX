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

    @Column({ length: 2048 })
    url: string;

    @Column({ length: 10, default: 'POST' })
    method: string;

    @Column({ type: 'text', array: true, default: () => "'{}'" })
    events: string[];

    @Column({ name: 'is_active', default: true })
    isActive: boolean;

    @Column({ length: 255, nullable: true })
    secret?: string;

    @Column({ type: 'jsonb', nullable: true })
    headers?: Record<string, string>;

    @Column({ type: 'jsonb', nullable: true })
    retryPolicy?: {
        maxRetries: number;
        retryInterval: number;
        backoffMultiplier?: number;
    };

    @Column({ type: 'integer', default: 30000 })
    timeout: number;

    @Column({ name: 'max_retries', type: 'integer', default: 3 })
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

    @OneToMany(() => WebhookLog, (webhookLog) => webhookLog.webhook)
    webhookLogs?: WebhookLog[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}