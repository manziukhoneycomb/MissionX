import { applyDecorators, SetMetadata, UseGuards, createParamDecorator, ExecutionContext } from '@nestjs/common';
import { RoleName } from '../../../domain/enums/role-name.enum';
import { TeamPermission } from '../../../domain/enums/team-permission.enum';
import { TeamGuard } from '../guards/team.guard';
import { RolesGuard } from '../guards/roles.guard';
import { RequestWithTeam, TeamContext } from '../../middleware/request-with-team.interface';

export const TEAM_ROLES_KEY = 'team_roles';
export const TEAM_PERMISSIONS_KEY = 'team_permissions';

export function RequireTeamRole(...roles: RoleName[]) {
    return applyDecorators(
        SetMetadata(TEAM_ROLES_KEY, roles),
        UseGuards(RolesGuard, TeamGuard)
    );
}

export function RequireTeamPermission(...permissions: TeamPermission[]) {
    return applyDecorators(
        SetMetadata(TEAM_PERMISSIONS_KEY, permissions),
        UseGuards(RolesGuard, TeamGuard)
    );
}

export function RequireTeamAccess(roles: RoleName[] = [], permissions: TeamPermission[] = []) {
    const decorators = [UseGuards(RolesGuard, TeamGuard)];
    
    if (roles.length > 0) {
        decorators.push(SetMetadata(TEAM_ROLES_KEY, roles));
    }
    
    if (permissions.length > 0) {
        decorators.push(SetMetadata(TEAM_PERMISSIONS_KEY, permissions));
    }
    
    return applyDecorators(...decorators);
}

export const CurrentTeam = createParamDecorator(
    (data: unknown, ctx: ExecutionContext): TeamContext => {
        const request: RequestWithTeam = ctx.switchToHttp().getRequest();
        return request.teamContext;
    },
);

export const TeamMember = createParamDecorator(
    (data: string | undefined, ctx: ExecutionContext): any => {
        const request: RequestWithTeam = ctx.switchToHttp().getRequest();
        const teamContext = request.teamContext;
        
        if (!teamContext) {
            return undefined;
        }
        
        if (data) {
            return teamContext[data as keyof TeamContext];
        }
        
        return {
            teamId: teamContext.teamId,
            roles: teamContext.teamRoles,
            isTeamMember: teamContext.isTeamMember,
        };
    },
);