import { applyDecorators, SetMetadata, UseGuards } from '@nestjs/common';
import { RoleName } from '../../../domain/enums/role-name.enum';
import { RolesGuard } from '../guards/roles.guard';

export const TEAM_ROLES_KEY = 'teamRoles';

export function RequireTeamRoles(...roles: RoleName[]) {
    return applyDecorators(SetMetadata(TEAM_ROLES_KEY, roles), UseGuards(RolesGuard));
}

export function TeamAdmin() {
    return RequireTeamRoles(RoleName.TEAM_ADMIN);
}

export function TeamMember() {
    return RequireTeamRoles(RoleName.TEAM_MEMBER, RoleName.TEAM_ADMIN);
}

export function TeamViewer() {
    return RequireTeamRoles(RoleName.TEAM_VIEWER, RoleName.TEAM_MEMBER, RoleName.TEAM_ADMIN);
}
