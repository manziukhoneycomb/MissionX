import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    ManyToOne,
    JoinColumn,
    CreateDateColumn,
} from 'typeorm';
import { Team } from './team.entity';
import { User } from './user.entity';
import { TeamRoleName } from '../enums/team-role-name.enum';

@Entity('team_member_roles')
export class TeamMemberRole {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'team_id' })
    teamId: string;

    @Column({ name: 'user_id' })
    userId: string;

    @Column({ type: 'enum', enum: TeamRoleName })
    roleName: TeamRoleName;

    @ManyToOne(() => Team, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'team_id' })
    team: Team;

    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_id' })
    user: User;

    @CreateDateColumn()
    createdAt: Date;
}