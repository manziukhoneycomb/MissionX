import { Injectable, Inject, NotFoundException, BadRequestException } from '@nestjs/common';
import { ITenantRepository, TENANT_REPOSITORY } from '../repositories/tenant.repository.interface';
import { Tenant } from '../../domain/entities/tenant.entity';
import { ITenantCommands } from './interfaces/tenant-commands.interface';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';
import { TenantDto } from './dto/tenant.dto';

@Injectable()
export class TenantCommands implements ITenantCommands {
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

    async createTenant(dto: CreateTenantDto): Promise<TenantDto> {
        const existingByAlias = await this.tenantRepository.findByAlias(dto.alias);

        if (existingByAlias) {
            throw new BadRequestException('Tenant alias already exists.');
        }

        const createdTenant = await this.tenantRepository.create(dto);

        return this.mapToDto(createdTenant);
    }

    async updateTenant(id: string, dto: UpdateTenantDto): Promise<TenantDto> {
        if (Object.keys(dto).length === 0) {
            const tenant = await this.tenantRepository.findById(id);

            if (!tenant) {
                throw new NotFoundException(`Tenant with ID ${id} not found`);
            }

            return this.mapToDto(tenant);
        }

        const updatedTenant = await this.tenantRepository.update(id, dto);

        if (!updatedTenant) {
            throw new NotFoundException(`Tenant with ID ${id} not found or could not be updated.`);
        }

        return this.mapToDto(updatedTenant);
    }

    async deleteTenant(id: string): Promise<void> {
        const deleted = await this.tenantRepository.delete(id);

        if (!deleted) {
            throw new NotFoundException(`Tenant with ID ${id} not found`);
        }
    }
}
