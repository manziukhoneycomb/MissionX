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
import { RoleName } from '../../../domain/enums/role-name.enum';
import { TEAM_ROLES_KEY } from '../decorators/team-authorize.decorator';
import { clerkClient } from '@clerk/clerk-sdk-node';
import { Request } from 'express';
import { extractErrorInfo } from '../../../domain/utils/error.utils';
import { ITeamRepository, TEAM_REPOSITORY } from '../../../application/repositories/team.repository.interface';

interface RequestWithUserAndTeam extends Request {
    userRoles?: RoleName[];
    userId?: string;
    teamId?: string;
    userTeamRole?: TeamRoleName;
}

@Injectable()
export class TeamGuard implements CanActivate {
    private readonly logger = new Logger(TeamGuard.name);

    constructor(
        private reflector: Reflector,
        @Inject(TEAM_REPOSITORY) private readonly teamRepository: ITeamRepository,
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        try {
            const requiredTeamRoles = this.reflector.getAllAndOverride<TeamRoleName[]>(TEAM_ROLES_KEY, [
                context.getHandler(),
                context.getClass(),
            ]);

            if (!requiredTeamRoles || requiredTeamRoles.length === 0) {
                return true;
            }

            const request: RequestWithUserAndTeam = context.switchToHttp().getRequest();
            const token: string | undefined = request.headers.authorization;

            if (!token) {
                throw new Error('Session token not found.');
            }

            const claims = await clerkClient.verifyToken(token);
            const userRoles = claims.roles as RoleName[] | undefined;
            const userId = claims.sub;

            if (!userRoles || !userId) {
                throw new ForbiddenException('User information not found.');
            }

            request.userRoles = userRoles;
            request.userId = userId;

            // Super admins bypass team role checks
            if (userRoles.includes(RoleName.SUPER_ADMIN)) {
                return true;
            }

            // Get team ID from request parameters
            const teamId = request.params.id || request.params.teamId;
            if (!teamId) {
                throw new ForbiddenException('Team ID not found in request');
            }

            request.teamId = teamId;

            // Get user's team members to check their role in this specific team
            const teamMembers = await this.teamRepository.getTeamMembers(teamId);
            const userTeamMembership = teamMembers.find(member => member.userId === userId);

            if (!userTeamMembership) {
                throw new ForbiddenException('User is not a member of this team');
            }

            request.userTeamRole = userTeamMembership.roleName;

            const hasRequiredTeamRole = requiredTeamRoles.includes(userTeamMembership.roleName);

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