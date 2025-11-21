import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    ManyToOne,
    JoinColumn,
    CreateDateColumn,
    UpdateDateColumn,
    Index,
} from 'typeorm';
import { Tenant } from '../../domain/entities/tenant.entity';

export enum SubscriptionStatus {
    ACTIVE = 'active',
    CANCELED = 'canceled',
    INCOMPLETE = 'incomplete',
    INCOMPLETE_EXPIRED = 'incomplete_expired',
    PAST_DUE = 'past_due',
    TRIALING = 'trialing',
    UNPAID = 'unpaid',
}

@Entity('subscriptions')
@Index(['tenantId'])
@Index(['stripeSubscriptionId'], { unique: true })
@Index(['stripeCustomerId'])
export class Subscription {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'stripe_subscription_id', unique: true })
    stripeSubscriptionId: string;

    @Column({ name: 'tenant_id' })
    tenantId: string;

    @Column({ name: 'stripe_customer_id' })
    stripeCustomerId: string;

    @Column({ name: 'stripe_price_id' })
    stripePriceId: string;

    @Column({
        type: 'enum',
        enum: SubscriptionStatus,
        default: SubscriptionStatus.INCOMPLETE,
    })
    status: SubscriptionStatus;

    @Column({ name: 'current_period_start', type: 'timestamp' })
    currentPeriodStart: Date;

    @Column({ name: 'current_period_end', type: 'timestamp' })
    currentPeriodEnd: Date;

    @Column({ name: 'trial_end', type: 'timestamp', nullable: true })
    trialEnd?: Date;

    @Column({ name: 'canceled_at', type: 'timestamp', nullable: true })
    canceledAt?: Date;

    @ManyToOne(() => Tenant, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'tenant_id' })
    tenant: Tenant;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
}