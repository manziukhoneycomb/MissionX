import { Request } from 'express';
import { RoleName } from '../../domain/enums/role-name.enum';

export interface RequestWithTenant extends Request {
    tenantId?: string;
    userRoles?: RoleName[];
}
