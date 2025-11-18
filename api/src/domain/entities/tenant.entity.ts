import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { User } from './user.entity';
import { Invoice } from './invoice.entity';

@Entity({ name: 'tenants' })
export class Tenant {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'varchar', length: 255, unique: true })
    name: string;

    @Column({ length: 50, unique: true })
    alias: string;

    @OneToMany(() => User, (user) => user.tenant)
    users?: User[];

    @OneToMany(() => Invoice, (invoice) => invoice.tenant)
    invoices?: Invoice[];
}
