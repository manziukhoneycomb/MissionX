import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    ManyToOne,
    JoinColumn,
    CreateDateColumn,
    UpdateDateColumn,
} from 'typeorm';
import { Webhook } from './webhook.entity';
import { Tenant } from './tenant.entity';

@Entity('webhook_events')
export class WebhookEvent {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'event_type', length: 100 })
    eventType: string;

    @Column({ name: 'event_name', length: 100 })
    eventName: string;

    @Column({ type: 'text', nullable: true })
    description?: string;

    @Column({ name: 'is_active', default: true })
    isActive: boolean;

    @Column({ name: 'webhook_id' })
    webhookId: string;

    @Column({ name: 'tenant_id' })
    tenantId: string;

    @ManyToOne(() => Webhook, (webhook) => webhook.webhookEvents, {
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

    @UpdateDateColumn()
    updatedAt: Date;
}