import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
    OneToMany,
    CreateDateColumn,
    UpdateDateColumn,
} from 'typeorm';
import { Tenant } from './tenant.entity';
import { TeamMember } from './team-member.entity';

@Entity({ name: 'teams' })
export class Team {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'varchar', length: 255 })
    name: string;

    @Column({ type: 'text', nullable: true })
    description?: string;

    @Column({ default: true })
    isActive: boolean;

    @Column({ name: 'tenant_id' })
    tenantId: string;

    @ManyToOne(() => Tenant, { onDelete: 'CASCADE', nullable: false })
    @JoinColumn({ name: 'tenant_id' })
    tenant: Tenant;

    @OneToMany(() => TeamMember, (teamMember) => teamMember.team, { cascade: true })
    members?: TeamMember[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
