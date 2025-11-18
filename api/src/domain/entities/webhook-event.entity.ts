import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    ManyToOne,
    JoinColumn,
    CreateDateColumn,
    UpdateDateColumn,
} from 'typeorm';
import { Tenant } from './tenant.entity';

@Entity('webhook_events')
export class WebhookEvent {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ length: 100 })
    eventType: string;

    @Column({ length: 255 })
    description: string;

    @Column({ default: true })
    isActive: boolean;

    @Column({ length: 50, nullable: true })
    category?: string;

    @Column('jsonb', { nullable: true })
    schema?: Record<string, any>;

    @Column({ name: 'tenant_id', nullable: true })
    tenantId?: string;

    @ManyToOne(() => Tenant, {
        onDelete: 'CASCADE',
        nullable: true,
    })
    @JoinColumn({ name: 'tenant_id' })
    tenant?: Tenant;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}