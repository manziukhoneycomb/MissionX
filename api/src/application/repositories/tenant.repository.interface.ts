import { Tenant } from '../../domain/entities/tenant.entity';
import { CreateTenantDto } from '../../application/tenants/dto/create-tenant.dto';
import { UpdateTenantDto } from '../../application/tenants/dto/update-tenant.dto';

export interface ITenantRepository {
    create(dto: CreateTenantDto): Promise<Tenant>;
    findAll(): Promise<Tenant[]>;
    findById(id: string): Promise<Tenant | null>;
    findByName(name: string): Promise<Tenant | null>;
    findByAlias(alias: string): Promise<Tenant | null>;
    update(id: string, dto: UpdateTenantDto): Promise<Tenant | null>;
    delete(id: string): Promise<boolean>;
}

export const TENANT_REPOSITORY = 'ITenantRepository';
