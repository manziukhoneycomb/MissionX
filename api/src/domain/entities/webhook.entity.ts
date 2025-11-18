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
import { WebhookLog } from './webhook-log.entity';

@Entity('webhooks')
export class Webhook {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'varchar', length: 2048 })
    url: string;

    @Column({ type: 'varchar', length: 10, default: 'POST' })
    method: string;

    @Column({ type: 'json' })
    events: string[];

    @Column({ type: 'boolean', default: true })
    isActive: boolean;

    @Column({ type: 'varchar', length: 255, nullable: true })
    secret?: string;

    @Column({ type: 'json', nullable: true })
    headers?: Record<string, string>;

    @Column({ type: 'json', nullable: true })
    retryPolicy?: {
        maxRetries: number;
        backoffType: 'linear' | 'exponential';
        initialDelay: number;
    };

    @Column({ type: 'integer', default: 30000 })
    timeout: number;

    @Column({ type: 'integer', default: 3 })
    maxRetries: number;

    @Column({ name: 'tenant_id' })
    tenantId: string;

    @ManyToOne(() => Tenant, {
        onDelete: 'CASCADE',
        nullable: false,
    })
    @JoinColumn({ name: 'tenant_id' })
    tenant: Tenant;

    @OneToMany(() => WebhookLog, (webhookLog) => webhookLog.webhook)
    logs?: WebhookLog[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}