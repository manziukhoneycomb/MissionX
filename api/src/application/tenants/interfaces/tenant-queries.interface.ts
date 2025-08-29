import { TenantDto } from '../dto/tenant.dto';

export interface ITenantQueries {
    findAllTenants(): Promise<TenantDto[]>;
    findTenantById(id: string): Promise<TenantDto>;
}

export const TENANT_QUERIES = 'ITenantQueries';
