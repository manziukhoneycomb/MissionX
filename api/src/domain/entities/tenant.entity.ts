import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { User } from './user.entity';
import { Invitation } from './invitation.entity';

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

    @OneToMany(() => Invitation, (invitation) => invitation.tenant)
    invitations?: Invitation[];
}
