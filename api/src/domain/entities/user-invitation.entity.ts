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
import { User } from './user.entity';

@Entity('user_invitations')
export class UserInvitation {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ length: 255 })
    email: string;

    @Column({ length: 100, nullable: true })
    firstName?: string;

    @Column({ length: 100, nullable: true })
    lastName?: string;

    @Column({ length: 255, name: 'invitation_token', unique: true })
    invitationToken: string;

    @Column({ type: 'enum', enum: ['pending', 'accepted', 'expired', 'revoked'], default: 'pending' })
    status: 'pending' | 'accepted' | 'expired' | 'revoked';

    @Column({ name: 'expires_at' })
    expiresAt: Date;

    @Column({ name: 'tenant_id' })
    tenantId: string;

    @ManyToOne(() => Tenant, (tenant) => tenant.users, {
        onDelete: 'CASCADE',
        nullable: false,
    })
    @JoinColumn({ name: 'tenant_id' })
    tenant: Tenant;

    @Column({ name: 'invited_by_user_id' })
    invitedByUserId: string;

    @ManyToOne(() => User, {
        onDelete: 'CASCADE',
        nullable: false,
    })
    @JoinColumn({ name: 'invited_by_user_id' })
    invitedBy: User;

    @Column({ name: 'accepted_by_user_id', nullable: true })
    acceptedByUserId?: string;

    @ManyToOne(() => User, {
        onDelete: 'SET NULL',
        nullable: true,
    })
    @JoinColumn({ name: 'accepted_by_user_id' })
    acceptedBy?: User;

    @Column({ name: 'accepted_at', nullable: true })
    acceptedAt?: Date;

    @Column({ type: 'text', nullable: true })
    message?: string;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
}