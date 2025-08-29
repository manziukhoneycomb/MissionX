import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Role } from '../../../domain/entities/role.entity';
import { RoleName } from '../../../domain/enums/role-name.enum';
import { IRoleRepository } from '../../../application/repositories/role.repository.interface';

@Injectable()
export class RoleRepository implements IRoleRepository {
    constructor(
        @InjectRepository(Role)
        private readonly ormRepository: Repository<Role>,
    ) {}

    async findByName(name: RoleName): Promise<Role | null> {
        return this.ormRepository.findOne({ where: { name } });
    }

    async findById(id: string): Promise<Role | null> {
        return this.ormRepository.findOne({ where: { id } });
    }

    async findAll(): Promise<Role[]> {
        return this.ormRepository.find();
    }

    async findByIds(ids: string[]): Promise<Role[]> {
        if (ids.length === 0) {
            return [];
        }
        return this.ormRepository.findBy({ id: In(ids) });
    }
}
