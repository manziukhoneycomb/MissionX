import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    ManyToOne,
    JoinColumn,
    CreateDateColumn,
    UpdateDateColumn,
    Unique,
} from 'typeorm';
import { Team } from './team.entity';
import { User } from './user.entity';
import { RoleName } from '../enums/role-name.enum';

@Entity({ name: 'team_roles' })
@Unique(['teamId', 'userId'])
export class TeamRole {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'team_id' })
    teamId: string;

    @Column({ name: 'user_id' })
    userId: string;

    @Column({
        type: 'enum',
        enum: [RoleName.TEAM_OWNER, RoleName.TEAM_ADMIN, RoleName.TEAM_MEMBER],
        default: RoleName.TEAM_MEMBER,
    })
    role: RoleName;

    @ManyToOne(() => Team, (team) => team.teamRoles, {
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

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}