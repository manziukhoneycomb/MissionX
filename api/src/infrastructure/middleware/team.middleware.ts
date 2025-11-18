import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { clerkClient } from '@clerk/clerk-sdk-node';
import { Response, NextFunction } from 'express';
import { RequestWithTeam, TeamContext } from './request-with-team.interface';
import { RoleName } from '../../domain/enums/role-name.enum';
import { RoleHierarchyUtil } from '../../domain/utils/role-hierarchy.util';
import { extractErrorInfo } from '../../domain/utils/error.utils';

@Injectable()
export class TeamMiddleware implements NestMiddleware {
    private readonly logger = new Logger(TeamMiddleware.name);

    async use(req: RequestWithTeam, res: Response, next: NextFunction) {
        try {
            const teamId = this.extractTeamIdFromRequest(req);
            
            if (teamId && req.userRoles) {
                const teamContext = await this.buildTeamContext(teamId, req.userRoles, req.headers.authorization);
                req.teamContext = teamContext;
            }
        } catch (error) {
            const { message } = extractErrorInfo(error, 'Team context extraction failed');
            this.logger.warn(`Team middleware error: ${message}`);
        }

        next();
    }

    private extractTeamIdFromRequest(req: RequestWithTeam): string | undefined {
        return (
            req.params?.teamId ||
            req.query?.teamId as string ||
            req.body?.teamId ||
            req.headers['x-team-id'] as string
        );
    }

    private async buildTeamContext(
        teamId: string,
        userRoles: RoleName[],
        token?: string
    ): Promise<TeamContext> {
        if (RoleHierarchyUtil.canBypassTeamRestrictions(userRoles)) {
            return {
                teamId,
                teamRoles: userRoles.filter(role => RoleHierarchyUtil.isGlobalRole(role)),
                isTeamMember: true,
            };
        }

        let teamRoles: RoleName[] = [];
        let isTeamMember = false;

        if (token) {
            try {
                const claims = await clerkClient.verifyToken(token);
                const clerkMetadata = claims.publicMetadata as any;
                
                if (clerkMetadata?.teams?.[teamId]) {
                    const teamRoleNames = clerkMetadata.teams[teamId].roles as string[];
                    teamRoles = teamRoleNames
                        .map(roleName => Object.values(RoleName).find(role => role === roleName))
                        .filter((role): role is RoleName => role !== undefined);
                    isTeamMember = true;
                }
            } catch (error) {
                const { message } = extractErrorInfo(error, 'Failed to extract team roles from token');
                this.logger.warn(`Team role extraction error: ${message}`);
            }
        }

        return {
            teamId,
            teamRoles,
            isTeamMember,
        };
    }
}