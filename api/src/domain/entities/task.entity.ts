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
import { User } from './user.entity';

export enum TaskStatus {
    NEW = 'New',
    ACTIVE = 'Active',
    RESOLVED = 'Resolved',
    CLOSED = 'Closed',
    REMOVED = 'Removed',
}

export enum TaskPriority {
    CRITICAL = 4,
    HIGH = 3,
    MEDIUM = 2,
    LOW = 1,
}

@Entity('tasks')
export class Task {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ length: 255 })
    title: string;

    @Column({ type: 'text', nullable: true })
    description?: string;

    @Column({
        type: 'enum',
        enum: TaskStatus,
        default: TaskStatus.NEW,
    })
    status: TaskStatus;

    @Column({
        type: 'enum',
        enum: TaskPriority,
        default: TaskPriority.MEDIUM,
    })
    priority: TaskPriority;

    @Column({ name: 'azure_devops_id', nullable: true })
    azureDevOpsId?: number;

    @Column({ name: 'azure_devops_url', nullable: true })
    azureDevOpsUrl?: string;

    @Column({ name: 'azure_devops_rev', nullable: true })
    azureDevOpsRev?: number;

    @Column({ name: 'last_sync_at', nullable: true })
    lastSyncAt?: Date;

    @Column({ name: 'sync_error', type: 'text', nullable: true })
    syncError?: string;

    @Column({ name: 'tenant_id' })
    tenantId: string;

    @ManyToOne(() => Tenant, (tenant) => tenant.id, {
        onDelete: 'CASCADE',
        nullable: false,
    })
    @JoinColumn({ name: 'tenant_id' })
    tenant: Tenant;

    @Column({ name: 'assigned_user_id', nullable: true })
    assignedUserId?: string;

    @ManyToOne(() => User, (user) => user.id, {
        onDelete: 'SET NULL',
        nullable: true,
    })
    @JoinColumn({ name: 'assigned_user_id' })
    assignedUser?: User;

    @Column({ name: 'created_by_id', nullable: true })
    createdById?: string;

    @ManyToOne(() => User, (user) => user.id, {
        onDelete: 'SET NULL',
        nullable: true,
    })
    @JoinColumn({ name: 'created_by_id' })
    createdBy?: User;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}