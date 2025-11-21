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

@Entity('billing_details')
@Index(['tenantId'], { unique: true })
@Index(['stripeCustomerId'], { unique: true })
export class BillingDetails {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'tenant_id', unique: true })
    tenantId: string;

    @Column({ name: 'stripe_customer_id', unique: true })
    stripeCustomerId: string;

    @Column({ name: 'billing_email' })
    billingEmail: string;

    @Column({ name: 'company_name', nullable: true })
    companyName?: string;

    @Column({ name: 'tax_id', nullable: true })
    taxId?: string;

    @Column({ name: 'address_line1', nullable: true })
    addressLine1?: string;

    @Column({ name: 'address_line2', nullable: true })
    addressLine2?: string;

    @Column({ nullable: true })
    city?: string;

    @Column({ nullable: true })
    state?: string;

    @Column({ name: 'postal_code', nullable: true })
    postalCode?: string;

    @Column({ nullable: true })
    country?: string;

    @ManyToOne(() => Tenant, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'tenant_id' })
    tenant: Tenant;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
}