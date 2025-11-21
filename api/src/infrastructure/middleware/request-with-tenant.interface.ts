import { Request } from 'express';
import { RoleName } from '../../domain/enums/role-name.enum';
import { UserPermissionContext } from '../auth/permission-resolution.service';

export interface RequestWithTenant extends Request {
    tenantId?: string;
    teamId?: string;
    userRoles?: RoleName[];
    userPermissionContext?: UserPermissionContext;
}
