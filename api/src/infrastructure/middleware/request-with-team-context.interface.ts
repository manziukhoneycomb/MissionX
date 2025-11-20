import { RequestWithTenant } from './request-with-tenant.interface';
import { UserPermissionContext } from '../auth/permission-resolution.service';

export interface RequestWithTeamContext extends RequestWithTenant {
    teamId?: string;
    userPermissionContext?: UserPermissionContext;
}
