import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    ManyToOne,
    OneToMany,
    JoinColumn,
    CreateDateColumn,
    Index,
} from 'typeorm';
import { Tenant } from '../../domain/entities/tenant.entity';

export enum InvoiceStatus {
    DRAFT = 'draft',
    OPEN = 'open',
    PAID = 'paid',
    UNCOLLECTIBLE = 'uncollectible',
    VOID = 'void',
}

@Entity('invoices')
@Index(['tenantId'])
@Index(['stripeInvoiceId'], { unique: true })
@Index(['stripeCustomerId'])
@Index(['stripeSubscriptionId'])
export class Invoice {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'stripe_invoice_id', unique: true })
    stripeInvoiceId: string;

    @Column({ name: 'tenant_id' })
    tenantId: string;

    @Column({ name: 'stripe_customer_id' })
    stripeCustomerId: string;

    @Column({ name: 'stripe_subscription_id', nullable: true })
    stripeSubscriptionId?: string;

    @Column()
    number: string;

    @Column({
        type: 'enum',
        enum: InvoiceStatus,
        default: InvoiceStatus.DRAFT,
    })
    status: InvoiceStatus;

    @Column({ name: 'amount_due', type: 'integer' })
    amountDue: number;

    @Column({ name: 'amount_paid', type: 'integer' })
    amountPaid: number;

    @Column({ type: 'integer' })
    subtotal: number;

    @Column({ type: 'integer' })
    tax: number;

    @Column({ type: 'integer' })
    total: number;

    @Column({ length: 3 })
    currency: string;

    @Column({ name: 'invoice_pdf', nullable: true })
    invoicePdf?: string;

    @Column({ name: 'hosted_invoice_url', nullable: true })
    hostedInvoiceUrl?: string;

    @Column({ name: 'finalized_at', type: 'timestamp', nullable: true })
    finalizedAt?: Date;

    @Column({ name: 'paid_at', type: 'timestamp', nullable: true })
    paidAt?: Date;

    @Column({ name: 'due_date', type: 'timestamp', nullable: true })
    dueDate?: Date;

    @ManyToOne(() => Tenant, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'tenant_id' })
    tenant: Tenant;

    @OneToMany(() => InvoiceLineItem, (lineItem) => lineItem.invoice, { cascade: true })
    lineItems: InvoiceLineItem[];

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;
}

@Entity('invoice_line_items')
@Index(['invoiceId'])
export class InvoiceLineItem {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'invoice_id' })
    invoiceId: string;

    @Column({ name: 'stripe_line_item_id' })
    stripeLineItemId: string;

    @Column()
    description: string;

    @Column({ type: 'integer' })
    amount: number;

    @Column({ length: 3 })
    currency: string;

    @Column({ type: 'integer' })
    quantity: number;

    @Column({ name: 'unit_amount', type: 'integer' })
    unitAmount: number;

    @Column({ name: 'period_start', type: 'timestamp', nullable: true })
    periodStart?: Date;

    @Column({ name: 'period_end', type: 'timestamp', nullable: true })
    periodEnd?: Date;

    @ManyToOne(() => Invoice, (invoice) => invoice.lineItems, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'invoice_id' })
    invoice: Invoice;
}