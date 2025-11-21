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
import { Subscription } from './subscription.entity';

@Entity('billing_events')
export class BillingEvent {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'stripe_event_id', length: 255, unique: true })
    stripeEventId: string;

    @Column({ name: 'tenant_id' })
    tenantId: string;

    @ManyToOne(() => Tenant, {
        onDelete: 'CASCADE',
        nullable: false,
    })
    @JoinColumn({ name: 'tenant_id' })
    tenant: Tenant;

    @Column({ name: 'subscription_id', nullable: true })
    subscriptionId?: string;

    @ManyToOne(() => Subscription, (subscription) => subscription.billingEvents, {
        onDelete: 'CASCADE',
        nullable: true,
    })
    @JoinColumn({ name: 'subscription_id' })
    subscription?: Subscription;

    @Column({ name: 'event_type', length: 100 })
    eventType: string;

    @Column({ type: 'enum', enum: ['invoice_payment_succeeded', 'invoice_payment_failed', 'customer_subscription_created', 'customer_subscription_updated', 'customer_subscription_deleted', 'payment_method_attached', 'payment_method_detached', 'setup_intent_succeeded', 'setup_intent_canceled'] })
    eventCategory: 'invoice_payment_succeeded' | 'invoice_payment_failed' | 'customer_subscription_created' | 'customer_subscription_updated' | 'customer_subscription_deleted' | 'payment_method_attached' | 'payment_method_detached' | 'setup_intent_succeeded' | 'setup_intent_canceled';

    @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
    amount?: number;

    @Column({ length: 3, nullable: true })
    currency?: string;

    @Column({ name: 'invoice_id', length: 255, nullable: true })
    invoiceId?: string;

    @Column({ name: 'payment_intent_id', length: 255, nullable: true })
    paymentIntentId?: string;

    @Column({ type: 'text', nullable: true })
    description?: string;

    @Column({ type: 'jsonb', nullable: true })
    metadata?: Record<string, any>;

    @Column({ type: 'enum', enum: ['pending', 'processed', 'failed'], default: 'pending' })
    processingStatus: 'pending' | 'processed' | 'failed';

    @Column({ name: 'processed_at', nullable: true })
    processedAt?: Date;

    @Column({ name: 'error_message', type: 'text', nullable: true })
    errorMessage?: string;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
}