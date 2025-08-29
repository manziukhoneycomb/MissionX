import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from '../../domain/entities/role.entity';
import { IRolesQueries } from './interfaces/roles-queries.interface';

@Injectable()
export class RolesQueries implements IRolesQueries {
    constructor(
        @InjectRepository(Role)
        private readonly roleRepository: Repository<Role>,
    ) {}

    async findAllRoles(): Promise<Role[]> {
        return this.roleRepository.find();
    }
}
