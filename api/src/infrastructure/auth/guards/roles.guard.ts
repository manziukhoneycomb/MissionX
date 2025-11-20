import {
    Injectable,
    CanActivate,
    ExecutionContext,
    ForbiddenException,
    Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RoleName } from '../../../domain/enums/role-name.enum';
import { ROLES_KEY, TEAM_ROLES_KEY } from '../decorators/authorize.decorator';
import { clerkClient } from '@clerk/clerk-sdk-node';
import { Request } from 'express';
import { extractErrorInfo } from '../../../domain/utils/error.utils';
import {
    PermissionResolutionService,
    UserPermissionContext,
} from '../permission-resolution.service';

interface RequestWithUserRoles extends Request {
    userRoles?: RoleName[];
    userPermissionContext?: UserPermissionContext;
    teamId?: string;
}

@Injectable()
export class RolesGuard implements CanActivate {
    private readonly logger = new Logger(RolesGuard.name);

    constructor(
        private reflector: Reflector,
        private permissionResolutionService: PermissionResolutionService,
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        try {
            const requiredRoles = this.reflector.getAllAndOverride<RoleName[]>(ROLES_KEY, [
                context.getHandler(),
                context.getClass(),
            ]);

            const requiredTeamRoles = this.reflector.getAllAndOverride<RoleName[]>(TEAM_ROLES_KEY, [
                context.getHandler(),
                context.getClass(),
            ]);

            const request: RequestWithUserRoles = context.switchToHttp().getRequest();
            const token: string | undefined = request.headers.authorization;

            if (!token) {
                throw new Error('Session token not found.');
            }

            const claims = await clerkClient.verifyToken(token);
            const userPermissionContext =
                this.permissionResolutionService.extractUserRolesFromClaims(claims);

            request.userPermissionContext = userPermissionContext;
            request.userRoles = userPermissionContext.globalRoles;

            const teamId = this.extractTeamIdFromRequest(request);

            if (requiredTeamRoles && requiredTeamRoles.length > 0) {
                if (!teamId) {
                    throw new ForbiddenException('Team context required but not found');
                }

                const hasTeamPermission = this.permissionResolutionService.hasPermission(
                    userPermissionContext,
                    requiredTeamRoles,
                    teamId,
                );

                if (!hasTeamPermission) {
                    throw new ForbiddenException('Insufficient team permissions');
                }
            }

            if (requiredRoles && requiredRoles.length > 0) {
                const hasGlobalPermission = this.permissionResolutionService.hasPermission(
                    userPermissionContext,
                    requiredRoles,
                    teamId,
                );

                if (!hasGlobalPermission) {
                    throw new ForbiddenException('Insufficient permissions');
                }
            }

            if (!requiredRoles?.length && !requiredTeamRoles?.length) {
                return true;
            }
        } catch (error: unknown) {
            const { message } = extractErrorInfo(error, 'Unknown authentication error');
            this.logger.error(`Authentication error: ${message}`);

            return false;
        }

        return true;
    }

    private extractTeamIdFromRequest(request: RequestWithUserRoles): string | undefined {
        return (
            request.teamId ||
            request.params?.teamId ||
            (request.query?.teamId as string) ||
            request.body?.teamId
        );
    }
}
