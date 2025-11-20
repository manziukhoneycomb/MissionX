import { Injectable, NestMiddleware, ForbiddenException, Logger } from '@nestjs/common';
import { Response, NextFunction } from 'express';
import { RequestWithTeamContext } from './request-with-team-context.interface';
import { PermissionResolutionService } from '../auth/permission-resolution.service';

@Injectable()
export class TeamContextMiddleware implements NestMiddleware {
    private readonly logger = new Logger(TeamContextMiddleware.name);

    constructor(private permissionResolutionService: PermissionResolutionService) {}

    async use(req: RequestWithTeamContext, res: Response, next: NextFunction) {
        try {
            const teamId = this.extractTeamIdFromRequest(req);

            if (teamId) {
                await this.validateTeamAccess(req, teamId);
                req.teamId = teamId;

                this.logger.debug(
                    `Team context set: ${teamId} for user: ${req.userPermissionContext?.userId}`,
                );
            }
        } catch (error) {
            this.logger.error(`Team context middleware error: ${error.message}`);
            throw error;
        }

        next();
    }

    private extractTeamIdFromRequest(req: RequestWithTeamContext): string | undefined {
        return (
            req.params?.teamId ||
            (req.query?.teamId as string) ||
            req.body?.teamId ||
            (req.headers['x-team-id'] as string)
        );
    }

    private async validateTeamAccess(req: RequestWithTeamContext, teamId: string): Promise<void> {
        if (!req.userPermissionContext) {
            throw new ForbiddenException(
                'User context not found. Ensure authentication middleware runs first.',
            );
        }

        if (!req.tenantId) {
            throw new ForbiddenException('Tenant context required for team access');
        }

        const canAccessTeam = this.permissionResolutionService.canViewTeam(
            req.userPermissionContext,
            teamId,
        );

        if (!canAccessTeam) {
            throw new ForbiddenException(`Access denied to team: ${teamId}`);
        }
    }
}
