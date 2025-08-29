import { Entity, Column, PrimaryGeneratedColumn, OneToMany, ManyToOne } from 'typeorm';
import { InvoiceItem } from './invoice-item.entity';
import { Tenant } from './tenant.entity';

@Entity('invoices')
export class Invoice {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ length: 50 })
    invoiceNumber!: string;

    @Column({ type: 'date' })
    issueDate!: string;

    @Column({ type: 'date' })
    dueDate!: string;

    @Column({ length: 255 })
    vendorName!: string;

    @Column({ type: 'text' })
    vendorAddress!: string;

    @Column({ length: 50 })
    vendorPhone!: string;

    @Column({ length: 100 })
    vendorEmail!: string;

    @Column({ length: 255 })
    customerName!: string;

    @Column({ type: 'text' })
    customerAddress!: string;

    @Column({ length: 50 })
    customerPhone!: string;

    @Column({ length: 100 })
    customerEmail!: string;

    @Column({ type: 'decimal', precision: 12, scale: 2 })
    subtotal!: number;

    @Column({ type: 'decimal', precision: 12, scale: 2 })
    discount!: number;

    @Column({ type: 'decimal', precision: 5, scale: 4 })
    taxRate!: number;

    @Column({ type: 'decimal', precision: 12, scale: 2 })
    taxAmount!: number;

    @Column({ type: 'decimal', precision: 12, scale: 2 })
    totalAmount!: number;

    @OneToMany(() => InvoiceItem, (item) => item.invoice, {
        cascade: true,
        eager: true,
    })
    items!: InvoiceItem[];

    @ManyToOne(() => Tenant)
    tenant!: Tenant;

    @Column()
    tenantId!: string;
}
