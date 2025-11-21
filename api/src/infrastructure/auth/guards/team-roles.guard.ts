import {
    Injectable,
    CanActivate,
    ExecutionContext,
    ForbiddenException,
    Logger,
    Inject,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { TeamRoleName } from '../../../domain/enums/team-role-name.enum';
import { TEAM_ROLES_KEY } from '../decorators/team-authorize.decorator';
import {
    ITeamRepository,
    TEAM_REPOSITORY,
} from '../../../application/repositories/team.repository.interface';
import { RequestWithTenant } from '../../middleware/request-with-tenant.interface';
import { extractErrorInfo } from '../../../domain/utils/error.utils';
import { clerkClient } from '@clerk/clerk-sdk-node';

interface RequestWithUserAndTeam extends RequestWithTenant {
    userId?: string;
    teamId?: string;
}

@Injectable()
export class TeamRolesGuard implements CanActivate {
    private readonly logger = new Logger(TeamRolesGuard.name);

    constructor(
        private reflector: Reflector,
        @Inject(TEAM_REPOSITORY)
        private readonly teamRepository: ITeamRepository,
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        try {
            const requiredTeamRoles = this.reflector.getAllAndOverride<TeamRoleName[]>(
                TEAM_ROLES_KEY,
                [context.getHandler(), context.getClass()],
            );

            if (!requiredTeamRoles || requiredTeamRoles.length === 0) {
                return true;
            }

            const request: RequestWithUserAndTeam = context.switchToHttp().getRequest();
            const token: string | undefined = request.headers.authorization;

            if (!token) {
                throw new Error('Session token not found.');
            }

            const claims = await clerkClient.verifyToken(token);
            const userId = claims.sub;

            if (!userId) {
                throw new ForbiddenException('User ID not found in token.');
            }

            request.userId = userId;

            const teamId = request.params?.id || request.params?.teamId;
            if (!teamId) {
                throw new ForbiddenException('Team ID not found in request parameters.');
            }

            request.teamId = teamId;

            const teamMembers = await this.teamRepository.getMembersByTeam(teamId);
            const userMembership = teamMembers.find(
                (member) => member.userId === userId && member.isActive,
            );

            if (!userMembership || !userMembership.teamRole) {
                throw new ForbiddenException('User is not a member of this team.');
            }

            const userTeamRole = userMembership.teamRole.name;
            const hasRequiredTeamRole = requiredTeamRoles.includes(userTeamRole);

            if (!hasRequiredTeamRole) {
                throw new ForbiddenException('Insufficient team permissions');
            }

            return true;
        } catch (error: unknown) {
            const { message } = extractErrorInfo(error, 'Unknown team authorization error');
            this.logger.error(`Team authorization error: ${message}`);

            return false;
        }
    }
}
