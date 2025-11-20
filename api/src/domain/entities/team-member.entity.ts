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
import { RoleName } from '../enums/role-name.enum';

@Entity('team_members')
@Unique(['teamId', 'userId'])
export class TeamMember {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'team_id' })
    teamId: string;

    @Column({ name: 'user_id' })
    userId: string;

    @Column({ type: 'enum', enum: RoleName })
    role: RoleName;

    @ManyToOne(() => Team, (team) => team.teamMembers, {
        onDelete: 'CASCADE',
        nullable: false,
    })
    @JoinColumn({ name: 'team_id' })
    team: Team;

    @ManyToOne(() => User, {
        onDelete: 'CASCADE',
        nullable: false,
    })
    @JoinColumn({ name: 'user_id' })
    user: User;

    @CreateDateColumn({ name: 'joined_at' })
    joinedAt: Date;
}
