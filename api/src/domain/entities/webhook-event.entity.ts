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

    @Column({ type: 'varchar', length: 255 })
    name: string;

    @Column({ type: 'varchar', length: 1000, nullable: true })
    description?: string;

    @Column({ type: 'json', nullable: true })
    schema?: Record<string, any>;

    @Column({ type: 'boolean', default: true })
    isActive: boolean;

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

    @UpdateDateColumn()
    updatedAt: Date;
}