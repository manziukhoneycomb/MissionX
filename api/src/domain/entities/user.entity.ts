import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    ManyToOne,
    JoinColumn,
    ManyToMany,
    JoinTable,
    CreateDateColumn,
    UpdateDateColumn,
} from 'typeorm';
import { Tenant } from './tenant.entity';
import { Role } from './role.entity';

@Entity('users')
export class User {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ length: 255, unique: true })
    email: string;

    @Column({ length: 255, unique: true, name: 'sub_id', nullable: true })
    subId?: string;

    @Column({ length: 100, nullable: true })
    firstName?: string;

    @Column({ length: 100, nullable: true })
    lastName?: string;

    @Column({ default: true })
    isActive: boolean;

    @Column({ name: 'tenant_id', nullable: true })
    tenantId?: string;

    @ManyToOne(() => Tenant, (tenant) => tenant.users, {
        onDelete: 'CASCADE',
        nullable: false,
    })
    @JoinColumn({ name: 'tenant_id' })
    tenant: Tenant;

    @ManyToMany(() => Role, (role) => role.users, {
        cascade: true,
    })
    @JoinTable({
        name: 'user_roles',
        joinColumn: { name: 'user_id', referencedColumnName: 'id' },
        inverseJoinColumn: { name: 'role_id', referencedColumnName: 'id' },
    })
    roles: Role[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
