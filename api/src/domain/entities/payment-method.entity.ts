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

@Entity('payment_methods')
export class PaymentMethod {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'stripe_payment_method_id', length: 255, unique: true })
    stripePaymentMethodId: string;

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

    @ManyToOne(() => Subscription, (subscription) => subscription.paymentMethods, {
        onDelete: 'CASCADE',
        nullable: true,
    })
    @JoinColumn({ name: 'subscription_id' })
    subscription?: Subscription;

    @Column({ type: 'enum', enum: ['card', 'bank_account', 'paypal'], default: 'card' })
    type: 'card' | 'bank_account' | 'paypal';

    @Column({ name: 'card_brand', length: 50, nullable: true })
    cardBrand?: string;

    @Column({ name: 'card_last_four', length: 4, nullable: true })
    cardLastFour?: string;

    @Column({ name: 'card_exp_month', type: 'int', nullable: true })
    cardExpMonth?: number;

    @Column({ name: 'card_exp_year', type: 'int', nullable: true })
    cardExpYear?: number;

    @Column({ name: 'billing_name', length: 255, nullable: true })
    billingName?: string;

    @Column({ name: 'billing_email', length: 255, nullable: true })
    billingEmail?: string;

    @Column({ name: 'billing_address_line1', length: 255, nullable: true })
    billingAddressLine1?: string;

    @Column({ name: 'billing_address_line2', length: 255, nullable: true })
    billingAddressLine2?: string;

    @Column({ name: 'billing_city', length: 100, nullable: true })
    billingCity?: string;

    @Column({ name: 'billing_state', length: 100, nullable: true })
    billingState?: string;

    @Column({ name: 'billing_postal_code', length: 20, nullable: true })
    billingPostalCode?: string;

    @Column({ name: 'billing_country', length: 2, nullable: true })
    billingCountry?: string;

    @Column({ name: 'is_default', default: false })
    isDefault: boolean;

    @Column({ name: 'is_active', default: true })
    isActive: boolean;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
}