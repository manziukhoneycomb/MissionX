import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { ITenantRepository, TENANT_REPOSITORY } from '../repositories/tenant.repository.interface';
import { Tenant } from '../../domain/entities/tenant.entity';
import { ITenantQueries } from './interfaces/tenant-queries.interface';
import { TenantDto } from './dto/tenant.dto';

@Injectable()
export class TenantQueries implements ITenantQueries {
    constructor(
        @Inject(TENANT_REPOSITORY)
        private readonly tenantRepository: ITenantRepository,
    ) {}

    private mapToDto(tenant: Tenant): TenantDto {
        const dto = new TenantDto();

        dto.id = tenant.id;
        dto.name = tenant.name;
        dto.alias = tenant.alias;

        return dto;
    }

    async findAllTenants(): Promise<TenantDto[]> {
        const tenants = await this.tenantRepository.findAll();

        return tenants.map((tenant: Tenant) => this.mapToDto(tenant));
    }

    async findTenantById(id: string): Promise<TenantDto> {
        const tenant = await this.tenantRepository.findById(id);

        if (!tenant) {
            throw new NotFoundException(`Tenant with ID ${id} not found`);
        }

        return this.mapToDto(tenant);
    }
}
