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
import { PaymentMethod } from './payment-method.entity';
import { BillingEvent } from './billing-event.entity';

@Entity('subscriptions')
export class Subscription {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'stripe_subscription_id', length: 255, unique: true })
    stripeSubscriptionId: string;

    @Column({ name: 'tenant_id' })
    tenantId: string;

    @ManyToOne(() => Tenant, {
        onDelete: 'CASCADE',
        nullable: false,
    })
    @JoinColumn({ name: 'tenant_id' })
    tenant: Tenant;

    @Column({ type: 'enum', enum: ['active', 'canceled', 'incomplete', 'incomplete_expired', 'past_due', 'paused', 'trialing', 'unpaid'], default: 'incomplete' })
    status: 'active' | 'canceled' | 'incomplete' | 'incomplete_expired' | 'past_due' | 'paused' | 'trialing' | 'unpaid';

    @Column({ name: 'plan_name', length: 100 })
    planName: string;

    @Column({ name: 'plan_id', length: 255 })
    planId: string;

    @Column({ type: 'decimal', precision: 10, scale: 2, name: 'amount' })
    amount: number;

    @Column({ length: 3, default: 'USD' })
    currency: string;

    @Column({ type: 'enum', enum: ['monthly', 'yearly'], name: 'billing_interval' })
    billingInterval: 'monthly' | 'yearly';

    @Column({ name: 'current_period_start' })
    currentPeriodStart: Date;

    @Column({ name: 'current_period_end' })
    currentPeriodEnd: Date;

    @Column({ name: 'cancel_at_period_end', default: false })
    cancelAtPeriodEnd: boolean;

    @Column({ name: 'canceled_at', nullable: true })
    canceledAt?: Date;

    @Column({ name: 'trial_start', nullable: true })
    trialStart?: Date;

    @Column({ name: 'trial_end', nullable: true })
    trialEnd?: Date;

    @OneToMany(() => PaymentMethod, (paymentMethod) => paymentMethod.subscription)
    paymentMethods?: PaymentMethod[];

    @OneToMany(() => BillingEvent, (billingEvent) => billingEvent.subscription)
    billingEvents?: BillingEvent[];

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
}