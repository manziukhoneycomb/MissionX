import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    ManyToOne,
    JoinColumn,
    CreateDateColumn,
    Index,
} from 'typeorm';
import { Tenant } from '../../domain/entities/tenant.entity';

export enum PaymentMethodType {
    CARD = 'card',
    BANK_ACCOUNT = 'us_bank_account',
    SEPA_DEBIT = 'sepa_debit',
}

@Entity('payment_methods')
@Index(['tenantId'])
@Index(['stripePaymentMethodId'], { unique: true })
@Index(['stripeCustomerId'])
export class PaymentMethod {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'stripe_payment_method_id', unique: true })
    stripePaymentMethodId: string;

    @Column({ name: 'tenant_id' })
    tenantId: string;

    @Column({ name: 'stripe_customer_id' })
    stripeCustomerId: string;

    @Column({
        type: 'enum',
        enum: PaymentMethodType,
        default: PaymentMethodType.CARD,
    })
    type: PaymentMethodType;

    @Column({ name: 'is_default', default: false })
    isDefault: boolean;

    // Card-specific fields
    @Column({ name: 'card_brand', nullable: true })
    cardBrand?: string;

    @Column({ name: 'card_last4', nullable: true })
    cardLast4?: string;

    @Column({ name: 'card_exp_month', nullable: true })
    cardExpMonth?: number;

    @Column({ name: 'card_exp_year', nullable: true })
    cardExpYear?: number;

    @Column({ name: 'card_country', nullable: true })
    cardCountry?: string;

    @ManyToOne(() => Tenant, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'tenant_id' })
    tenant: Tenant;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;
}