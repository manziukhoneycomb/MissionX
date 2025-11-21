import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
    CreateDateColumn,
    UpdateDateColumn,
} from 'typeorm';
import { Team } from './team.entity';
import { User } from './user.entity';
import { TeamRole } from './team-role.entity';

@Entity('team_members')
export class TeamMember {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'team_id' })
    teamId: string;

    @Column({ name: 'user_id' })
    userId: string;

    @Column({ name: 'team_role_id' })
    teamRoleId: string;

    @Column({ default: true })
    isActive: boolean;

    @ManyToOne(() => Team, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'team_id' })
    team: Team;

    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_id' })
    user: User;

    @ManyToOne(() => TeamRole, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'team_role_id' })
    teamRole: TeamRole;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
