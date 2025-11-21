import { applyDecorators, SetMetadata, UseGuards } from '@nestjs/common';
import { RoleName } from '../../../domain/enums/role-name.enum';
import { RolesGuard } from '../guards/roles.guard';

export const TEAM_ROLES_KEY = 'teamRoles';

export function TeamRoles(...roles: RoleName[]) {
    return applyDecorators(SetMetadata(TEAM_ROLES_KEY, roles), UseGuards(RolesGuard));
}

export function RequireTeamMembership() {
    return TeamRoles(RoleName.TEAM_ADMIN, RoleName.TEAM_MEMBER, RoleName.TEAM_VIEWER);
}

export function RequireTeamAdmin() {
    return TeamRoles(RoleName.TEAM_ADMIN);
}

export function RequireTeamAdminOrGlobalAdmin() {
    return applyDecorators(
        SetMetadata(TEAM_ROLES_KEY, [RoleName.TEAM_ADMIN]),
        SetMetadata('roles', [RoleName.SUPER_ADMIN, RoleName.ADMIN]),
        UseGuards(RolesGuard),
    );
}
