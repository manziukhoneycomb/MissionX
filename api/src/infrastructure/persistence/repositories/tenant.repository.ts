import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tenant } from '../../../domain/entities/tenant.entity';
import { ITenantRepository } from '../../../application/repositories/tenant.repository.interface';
import { CreateTenantDto } from '../../../application/tenants/dto/create-tenant.dto';
import { UpdateTenantDto } from '../../../application/tenants/dto/update-tenant.dto';

@Injectable()
export class TenantRepository implements ITenantRepository {
    constructor(
        @InjectRepository(Tenant)
        private readonly ormRepository: Repository<Tenant>,
    ) {}

    async create(dto: CreateTenantDto): Promise<Tenant> {
        const tenant = this.ormRepository.create(dto);

        return this.ormRepository.save(tenant);
    }

    async findAll(): Promise<Tenant[]> {
        return this.ormRepository.find();
    }

    async findById(id: string): Promise<Tenant | null> {
        return this.ormRepository.findOne({ where: { id } });
    }

    async findByName(name: string): Promise<Tenant | null> {
        return this.ormRepository.findOne({ where: { name } });
    }

    async findByAlias(alias: string): Promise<Tenant | null> {
        return this.ormRepository.findOne({ where: { alias } });
    }

    async update(id: string, dto: UpdateTenantDto): Promise<Tenant | null> {
        const updateData = { ...dto };

        if (Object.keys(updateData).length === 0) {
            return this.findById(id);
        }

        const result = await this.ormRepository.update(id, updateData);

        if (result.affected === 0) {
            return null;
        }

        return this.findById(id);
    }

    async delete(id: string): Promise<boolean> {
        const result = await this.ormRepository.delete(id);

        return !!result?.affected && result.affected > 0;
    }
}
