import { Request } from 'express';
import { RoleName } from '../../domain/enums/role-name.enum';

export interface TeamContext {
    teamId: string;
    teamRoles: RoleName[];
    isTeamMember: boolean;
}

export interface RequestWithTeam extends Request {
    tenantId?: string;
    userRoles?: RoleName[];
    teamContext?: TeamContext;
}