import {
    Injectable,
    CanActivate,
    ExecutionContext,
    ForbiddenException,
    Logger,
    BadRequestException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RoleName } from '../../../domain/enums/role-name.enum';
import { TeamPermission } from '../../../domain/enums/team-permission.enum';
import { RoleHierarchyUtil } from '../../../domain/utils/role-hierarchy.util';
import { RequestWithTeam } from '../../middleware/request-with-team.interface';
import { extractErrorInfo } from '../../../domain/utils/error.utils';
import { TEAM_ROLES_KEY, TEAM_PERMISSIONS_KEY } from '../decorators/team-auth.decorator';

@Injectable()
export class TeamGuard implements CanActivate {
    private readonly logger = new Logger(TeamGuard.name);

    constructor(private reflector: Reflector) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        try {
            const request: RequestWithTeam = context.switchToHttp().getRequest();
            const requiredRoles = this.reflector.getAllAndOverride<RoleName[]>(TEAM_ROLES_KEY, [
                context.getHandler(),
                context.getClass(),
            ]);
            const requiredPermissions = this.reflector.getAllAndOverride<TeamPermission[]>(TEAM_PERMISSIONS_KEY, [
                context.getHandler(),
                context.getClass(),
            ]);

            if (!request.teamContext) {
                throw new BadRequestException('Team context is required for this operation');
            }

            const { teamRoles, isTeamMember } = request.teamContext;
            const globalRoles = request.userRoles || [];

            if (RoleHierarchyUtil.canBypassTeamRestrictions(globalRoles)) {
                return true;
            }

            if (!isTeamMember) {
                throw new ForbiddenException('User is not a member of this team');
            }

            if (requiredRoles && requiredRoles.length > 0) {
                const hasRequiredRole = this.checkTeamRoles(teamRoles, requiredRoles);
                if (!hasRequiredRole) {
                    throw new ForbiddenException('Insufficient team role permissions');
                }
            }

            if (requiredPermissions && requiredPermissions.length > 0) {
                const hasRequiredPermissions = this.checkTeamPermissions(teamRoles, requiredPermissions);
                if (!hasRequiredPermissions) {
                    throw new ForbiddenException('Insufficient team permissions');
                }
            }

            return true;
        } catch (error: unknown) {
            const { message } = extractErrorInfo(error, 'Team authorization failed');
            this.logger.error(`Team authorization error: ${message}`);

            if (error instanceof ForbiddenException || error instanceof BadRequestException) {
                throw error;
            }

            return false;
        }
    }

    private checkTeamRoles(userTeamRoles: RoleName[], requiredRoles: RoleName[]): boolean {
        return requiredRoles.some(requiredRole =>
            userTeamRoles.some(userRole => 
                userRole === requiredRole || 
                RoleHierarchyUtil.hasHigherPrecedence(userRole, requiredRole)
            )
        );
    }

    private checkTeamPermissions(userTeamRoles: RoleName[], requiredPermissions: TeamPermission[]): boolean {
        return requiredPermissions.every(permission =>
            userTeamRoles.some(role => 
                RoleHierarchyUtil.hasTeamPermission(role, permission)
            )
        );
    }
}