import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
    ManyToMany,
    JoinTable,
    CreateDateColumn,
    UpdateDateColumn,
} from 'typeorm';
import { Team } from './team.entity';
import { User } from './user.entity';
import { Role } from './role.entity';

@Entity({ name: 'team_members' })
export class TeamMember {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'team_id' })
    teamId: string;

    @Column({ name: 'user_id' })
    userId: string;

    @Column({ default: true })
    isActive: boolean;

    @ManyToOne(() => Team, (team) => team.members, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'team_id' })
    team: Team;

    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_id' })
    user: User;

    @ManyToMany(() => Role, { cascade: true })
    @JoinTable({
        name: 'team_member_roles',
        joinColumn: { name: 'team_member_id', referencedColumnName: 'id' },
        inverseJoinColumn: { name: 'role_id', referencedColumnName: 'id' },
    })
    teamRoles: Role[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
