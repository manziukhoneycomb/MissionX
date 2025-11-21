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
import { Role } from './role.entity';

@Entity('team_members')
export class TeamMember {
    @PrimaryGeneratedColumn('uuid')
    readonly id: string;

    @Column({ name: 'team_id' })
    readonly teamId: string;

    @ManyToOne(() => Team, (team) => team.members, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'team_id' })
    readonly team: Team;

    @Column({ name: 'user_id' })
    readonly userId: string;

    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_id' })
    readonly user: User;

    @Column({ name: 'role_id' })
    readonly roleId: string;

    @ManyToOne(() => Role, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'role_id' })
    readonly role: Role;

    @CreateDateColumn({ name: 'joined_at' })
    readonly joinedAt: Date;
}
