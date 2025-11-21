import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    ManyToOne,
    JoinColumn,
    OneToMany,
    CreateDateColumn,
    UpdateDateColumn,
    DeleteDateColumn,
} from 'typeorm';
import { Tenant } from './tenant.entity';
import { TeamMember } from './team-member.entity';

@Entity('teams')
export class Team {
    @PrimaryGeneratedColumn('uuid')
    readonly id: string;

    @Column({ length: 255 })
    readonly name: string;

    @Column({ type: 'text', nullable: true })
    readonly description?: string;

    @Column({ name: 'tenant_id' })
    readonly tenantId: string;

    @ManyToOne(() => Tenant, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'tenant_id' })
    readonly tenant: Tenant;

    @OneToMany(() => TeamMember, (teamMember) => teamMember.team)
    readonly members?: TeamMember[];

    @CreateDateColumn()
    readonly createdAt: Date;

    @UpdateDateColumn()
    readonly updatedAt: Date;

    @DeleteDateColumn()
    readonly deletedAt?: Date;
}
