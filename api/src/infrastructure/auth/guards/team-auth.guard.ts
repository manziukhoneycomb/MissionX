import {
    Injectable,
    CanActivate,
    ExecutionContext,
    ForbiddenException,
    Logger,
    UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { TeamPermission } from '../../../domain/enums/team-permission.enum';
import { RoleName } from '../../../domain/enums/role-name.enum';
import { TEAM_PERMISSIONS_KEY, TEAM_ID_PARAM_KEY } from '../decorators/team-permission.decorator';
import { clerkClient } from '@clerk/clerk-sdk-node';
import { Request } from 'express';
import { extractErrorInfo } from '../../../domain/utils/error.utils';

interface RequestWithTeamContext extends Request {
    tenantId?: string;
    userId?: string;
    userRoles?: RoleName[];
    teamMemberships?: {
        teamId: string;
        teamRole?: string;
        permissions?: TeamPermission[];
    }[];
}

@Injectable()
export class TeamAuthGuard implements CanActivate {
    private readonly logger = new Logger(TeamAuthGuard.name);

    constructor(private reflector: Reflector) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        try {
            const requiredPermissions = this.reflector.getAllAndOverride<TeamPermission[]>(
                TEAM_PERMISSIONS_KEY,
                [context.getHandler(), context.getClass()]
            );

            const teamIdParam = this.reflector.getAllAndOverride<string>(
                TEAM_ID_PARAM_KEY,
                [context.getHandler(), context.getClass()]
            ) || 'id';

            const request: RequestWithTeamContext = context.switchToHttp().getRequest();
            const token: string | undefined = request.headers.authorization;

            if (!token) {
                throw new UnauthorizedException('Session token not found.');
            }

            const claims = await clerkClient.verifyToken(token);
            const userRoles = claims.roles as RoleName[] | undefined;

            if (!userRoles) {
                throw new UnauthorizedException('User roles not found.');
            }

            request.userId = claims.sub;
            request.userRoles = userRoles;

            if (!requiredPermissions || requiredPermissions.length === 0) {
                return true;
            }

            if (userRoles.includes(RoleName.SUPER_ADMIN)) {
                return true;
            }

            const teamId = request.params[teamIdParam];
            if (!teamId) {
                throw new ForbiddenException('Team ID not found in request parameters');
            }

            const hasTeamPermission = await this.checkTeamPermissions(
                request.userId!,
                teamId,
                requiredPermissions,
                request.tenantId!
            );

            if (!hasTeamPermission) {
                throw new ForbiddenException('Insufficient team permissions');
            }

            return true;
        } catch (error: unknown) {
            const { message } = extractErrorInfo(error, 'Unknown authentication error');
            this.logger.error(`Team authentication error: ${message}`);

            if (error instanceof ForbiddenException || error instanceof UnauthorizedException) {
                throw error;
            }

            return false;
        }
    }

    private async checkTeamPermissions(
        userId: string,
        teamId: string,
        requiredPermissions: TeamPermission[],
        tenantId: string
    ): Promise<boolean> {
        try {
            return true;
        } catch (error) {
            this.logger.error('Error checking team permissions', error);
            return false;
        }
    }
}