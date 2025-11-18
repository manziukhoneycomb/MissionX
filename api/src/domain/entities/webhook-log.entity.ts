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

    @Column({ name: 'webhook_id' })
    webhookId: string;

    @ManyToOne(() => Webhook, (webhook) => webhook.logs, {
        onDelete: 'CASCADE',
        nullable: false,
    })
    @JoinColumn({ name: 'webhook_id' })
    webhook: Webhook;

    @Column({ length: 100 })
    eventType: string;

    @Column('jsonb')
    payload: Record<string, any>;

    @Column({ length: 20 })
    status: string;

    @Column({ type: 'int', nullable: true })
    httpStatusCode?: number;

    @Column('text', { nullable: true })
    response?: string;

    @Column('text', { nullable: true })
    error?: string;

    @Column({ type: 'int', default: 0 })
    attempts: number;

    @Column({ nullable: true })
    nextRetryAt?: Date;

    @Column({ type: 'int', nullable: true })
    duration?: number;

    @Column({ name: 'tenant_id' })
    tenantId: string;

    @ManyToOne(() => Tenant, {
        onDelete: 'CASCADE',
        nullable: false,
    })
    @JoinColumn({ name: 'tenant_id' })
    tenant: Tenant;

    @CreateDateColumn()
    createdAt: Date;
}