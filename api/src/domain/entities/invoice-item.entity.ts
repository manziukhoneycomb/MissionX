import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Invoice } from './invoice.entity';

@Entity('invoice_items')
export class InvoiceItem {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @ManyToOne(() => Invoice, (invoice) => invoice.items, {
        onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'invoiceId' })
    invoice!: Invoice;

    @Column()
    invoiceId!: string;

    @Column({ type: 'integer' })
    lineNumber!: number;

    @Column({ length: 255 })
    description!: string;

    @Column({ type: 'integer' })
    quantity!: number;

    @Column({ type: 'decimal', precision: 12, scale: 2 })
    unitPrice!: number;

    @Column({ type: 'decimal', precision: 12, scale: 2 })
    amount!: number;
}
