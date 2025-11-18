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

    @Column({ length: 500 })
    url: string;

    @Column({ length: 10, default: 'POST' })
    method: string;

    @Column('text', { array: true })
    events: string[];

    @Column({ default: true })
    isActive: boolean;

    @Column({ length: 255, nullable: true })
    secret?: string;

    @Column('jsonb', { nullable: true })
    headers?: Record<string, string>;

    @Column('jsonb', { nullable: true })
    retryPolicy?: {
        maxRetries: number;
        backoffStrategy: 'linear' | 'exponential';
        initialDelay: number;
    };

    @Column({ type: 'int', default: 30000 })
    timeout: number;

    @Column({ type: 'int', default: 3 })
    maxRetries: number;

    @Column({ name: 'tenant_id' })
    tenantId: string;

    @ManyToOne(() => Tenant, {
        onDelete: 'CASCADE',
        nullable: false,
    })
    @JoinColumn({ name: 'tenant_id' })
    tenant: Tenant;

    @OneToMany(() => WebhookLog, (log) => log.webhook)
    logs?: WebhookLog[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}