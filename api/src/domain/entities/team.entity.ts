import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    ManyToOne,
    JoinColumn,
    OneToMany,
    CreateDateColumn,
    UpdateDateColumn,
    Unique,
} from 'typeorm';
import { Tenant } from './tenant.entity';
import { TeamMember } from './team-member.entity';
import { TeamRole } from './team-role.entity';

@Entity('teams')
@Unique(['name', 'tenantId'])
export class Team {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ length: 255 })
    name: string;

    @Column({ type: 'text', nullable: true })
    description?: string;

    @Column({ name: 'tenant_id' })
    tenantId: string;

    @ManyToOne(() => Tenant, (tenant) => tenant.teams, {
        onDelete: 'CASCADE',
        nullable: false,
    })
    @JoinColumn({ name: 'tenant_id' })
    tenant: Tenant;

    @OneToMany(() => TeamMember, (teamMember) => teamMember.team)
    teamMembers?: TeamMember[];

    @OneToMany(() => TeamRole, (teamRole) => teamRole.team)
    teamRoles?: TeamRole[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}