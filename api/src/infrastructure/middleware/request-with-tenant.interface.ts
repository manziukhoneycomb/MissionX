import { Request } from 'express';
import { RoleName } from '../../domain/enums/role-name.enum';
import { TeamPermission } from '../../domain/enums/team-permission.enum';

export interface RequestWithTenant extends Request {
    tenantId?: string;
    userId?: string;
    userRoles?: RoleName[];
    teamMemberships?: {
        teamId: string;
        teamRole?: string;
        permissions?: TeamPermission[];
    }[];
}
