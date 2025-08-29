import { Entity, PrimaryGeneratedColumn, Column, ManyToMany } from 'typeorm';
import { User } from './user.entity';
import { RoleName } from '../enums/role-name.enum';

@Entity({ name: 'roles' })
export class Role {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'enum', enum: RoleName, unique: true })
    name: RoleName;

    @ManyToMany(() => User, (user) => user.roles)
    users?: User[];
}
