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
import { Team } from './team.entity';
import { TeamMember } from './team-member.entity';

@Entity('team_roles')
@Unique(['name', 'teamId'])
export class TeamRole {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'team_id' })
    teamId: string;

    @Column({ length: 100 })
    name: string;

    @Column({ type: 'json', nullable: true })
    permissions?: Record<string, any>;

    @Column({ name: 'inherit_from_global_role', default: false })
    inheritFromGlobalRole: boolean;

    @ManyToOne(() => Team, (team) => team.teamRoles, {
        onDelete: 'CASCADE',
        nullable: false,
    })
    @JoinColumn({ name: 'team_id' })
    team: Team;

    @OneToMany(() => TeamMember, (teamMember) => teamMember.teamRole)
    teamMembers?: TeamMember[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}