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

    @Column({ type: 'varchar', length: 255 })
    eventType: string;

    @Column({ type: 'json' })
    payload: Record<string, any>;

    @Column({ type: 'integer' })
    statusCode: number;

    @Column({ type: 'text', nullable: true })
    responseBody?: string;

    @Column({ type: 'text', nullable: true })
    errorMessage?: string;

    @Column({ type: 'integer', default: 0 })
    retryCount: number;

    @Column({ type: 'boolean', default: false })
    isSuccess: boolean;

    @Column({ type: 'integer', nullable: true })
    responseTime?: number;

    @Column({ name: 'tenant_id' })
    tenantId: string;

    @ManyToOne(() => Webhook, (webhook) => webhook.logs, {
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