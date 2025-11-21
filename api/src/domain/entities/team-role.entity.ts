import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { TeamMember } from './team-member.entity';
import { TeamRoleName } from '../enums/team-role-name.enum';

@Entity({ name: 'team_roles' })
export class TeamRole {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'enum', enum: TeamRoleName, unique: true })
    name: TeamRoleName;

    @Column({ length: 500, nullable: true })
    description?: string;

    @OneToMany(() => TeamMember, (teamMember) => teamMember.teamRole)
    teamMembers?: TeamMember[];
}
