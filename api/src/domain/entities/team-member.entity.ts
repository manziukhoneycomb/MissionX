import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    ManyToOne,
    JoinColumn,
    CreateDateColumn,
    Index,
} from 'typeorm';
import { Team } from './team.entity';
import { User } from './user.entity';
import { Role } from './role.entity';

@Entity('team_members')
@Index(['teamId', 'userId'], { unique: true })
export class TeamMember {
    @PrimaryGeneratedColumn('uuid')
    readonly id: string;

    @Column({ name: 'team_id' })
    readonly teamId: string;

    @Column({ name: 'user_id' })
    readonly userId: string;

    @Column({ name: 'role_id' })
    readonly roleId: string;

    @ManyToOne(() => Team, (team) => team.members, {
        onDelete: 'CASCADE',
        nullable: false,
    })
    @JoinColumn({ name: 'team_id' })
    readonly team: Team;

    @ManyToOne(() => User, {
        onDelete: 'CASCADE',
        nullable: false,
    })
    @JoinColumn({ name: 'user_id' })
    readonly user: User;

    @ManyToOne(() => Role, {
        onDelete: 'CASCADE',
        nullable: false,
    })
    @JoinColumn({ name: 'role_id' })
    readonly role: Role;

    @CreateDateColumn({ name: 'joined_at' })
    readonly joinedAt: Date;
}
