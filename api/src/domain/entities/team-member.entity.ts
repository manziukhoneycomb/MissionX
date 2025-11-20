import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    ManyToOne,
    JoinColumn,
    CreateDateColumn,
    Unique,
} from 'typeorm';
import { Team } from './team.entity';
import { User } from './user.entity';
import { TeamRole } from './team-role.entity';

@Entity('team_members')
@Unique(['teamId', 'userId'])
export class TeamMember {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'team_id' })
    teamId: string;

    @Column({ name: 'user_id' })
    userId: string;

    @Column({ name: 'team_role_id', nullable: true })
    teamRoleId?: string;

    @ManyToOne(() => Team, (team) => team.teamMembers, {
        onDelete: 'CASCADE',
        nullable: false,
    })
    @JoinColumn({ name: 'team_id' })
    team: Team;

    @ManyToOne(() => User, (user) => user.teamMembers, {
        onDelete: 'CASCADE',
        nullable: false,
    })
    @JoinColumn({ name: 'user_id' })
    user: User;

    @ManyToOne(() => TeamRole, (teamRole) => teamRole.teamMembers, {
        onDelete: 'SET NULL',
        nullable: true,
    })
    @JoinColumn({ name: 'team_role_id' })
    teamRole?: TeamRole;

    @CreateDateColumn({ name: 'joined_at' })
    joinedAt: Date;
}