import { applyDecorators, SetMetadata, UseGuards } from '@nestjs/common';
import { TeamPermission } from '../../../domain/enums/team-permission.enum';
import { TeamAuthGuard } from '../guards/team-auth.guard';

export const TEAM_PERMISSIONS_KEY = 'team_permissions';
export const TEAM_ID_PARAM_KEY = 'team_id_param';

export function RequireTeamPermission(
    ...permissions: TeamPermission[]
): MethodDecorator {
    return applyDecorators(
        SetMetadata(TEAM_PERMISSIONS_KEY, permissions),
        UseGuards(TeamAuthGuard)
    );
}

export function TeamIdFromParam(paramName: string = 'id'): MethodDecorator {
    return SetMetadata(TEAM_ID_PARAM_KEY, paramName);
}