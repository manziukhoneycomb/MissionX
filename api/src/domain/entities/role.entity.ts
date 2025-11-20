import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, Index } from 'typeorm';
import { User } from './user.entity';
import { RoleName } from '../enums/role-name.enum';

@Entity({ name: 'roles' })
@Index(['name', 'teamId'], { unique: true })
export class Role {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'enum', enum: RoleName })
    name: RoleName;

    @Column({ type: 'uuid', nullable: true })
    teamId?: string;

    @ManyToMany(() => User, (user) => user.roles)
    users?: User[];

    get isGlobalRole(): boolean {
        return this.teamId === null || this.teamId === undefined;
    }

    get isTeamRole(): boolean {
        return this.teamId !== null && this.teamId !== undefined;
    }
}
