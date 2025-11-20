import {
    Injectable,
    CanActivate,
    ExecutionContext,
    ForbiddenException,
    Logger,
    Inject,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RoleName } from '../../../domain/enums/role-name.enum';
import {
    ITeamRepository,
    TEAM_REPOSITORY,
} from '../../../application/repositories/team.repository.interface';
import { RequestWithTenant } from '../../middleware/request-with-tenant.interface';
import { clerkClient } from '@clerk/clerk-sdk-node';
import { extractErrorInfo } from '../../../domain/utils/error.utils';

interface RequestWithTeamAccess extends RequestWithTenant {
    userRoles?: RoleName[];
    userId?: string;
}

export const TEAM_ACCESS_KEY = 'teamAccess';

@Injectable()
export class TeamAccessGuard implements CanActivate {
    private readonly logger = new Logger(TeamAccessGuard.name);

    constructor(
        private reflector: Reflector,
        @Inject(TEAM_REPOSITORY) private readonly teamRepository: ITeamRepository,
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        try {
            const requiresTeamAccess = this.reflector.getAllAndOverride<boolean>(TEAM_ACCESS_KEY, [
                context.getHandler(),
                context.getClass(),
            ]);

            if (!requiresTeamAccess) {
                return true;
            }

            const request: RequestWithTeamAccess = context.switchToHttp().getRequest();
            const token: string | undefined = request.headers.authorization;

            if (!token) {
                throw new Error('Session token not found.');
            }

            const claims = await clerkClient.verifyToken(token);
            const userId = claims.sub;
            const userRoles = claims.roles as RoleName[] | undefined;

            if (!userId || !userRoles) {
                throw new ForbiddenException('User information not found.');
            }

            request.userId = userId;
            request.userRoles = userRoles;

            if (userRoles.includes(RoleName.SUPER_ADMIN) || userRoles.includes(RoleName.ADMIN)) {
                return true;
            }

            const teamId = request.params?.id;
            if (teamId && request.tenantId) {
                const teamMember = await this.teamRepository.findTeamMember(teamId, userId, [
                    'teamRoles',
                ]);
                if (teamMember && teamMember.isActive) {
                    const hasTeamRole = teamMember.teamRoles?.some(
                        (role) =>
                            role.name === RoleName.TEAM_OWNER || role.name === RoleName.TEAM_ADMIN,
                    );
                    if (hasTeamRole) {
                        return true;
                    }
                }
            }

            return false;
        } catch (error: unknown) {
            const { message } = extractErrorInfo(error, 'Unknown team access error');
            this.logger.error(`Team access error: ${message}`);
            return false;
        }
    }
}
