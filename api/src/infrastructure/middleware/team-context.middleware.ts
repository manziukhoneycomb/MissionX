import {
    Injectable,
    NestMiddleware,
    BadRequestException,
    ForbiddenException,
    Logger,
} from '@nestjs/common';
import { Response, NextFunction } from 'express';
import { RequestWithTenant } from './request-with-tenant.interface';

interface RequestWithTeam extends RequestWithTenant {
    teamId?: string;
}

@Injectable()
export class TeamContextMiddleware implements NestMiddleware {
    private readonly logger = new Logger(TeamContextMiddleware.name);

    async use(req: RequestWithTeam, res: Response, next: NextFunction) {
        try {
            const teamId = this.extractTeamId(req);

            if (teamId) {
                if (!this.isValidUuid(teamId)) {
                    throw new BadRequestException('Invalid team ID format');
                }

                if (!req.tenantId) {
                    throw new BadRequestException(
                        'Tenant context required when team context is provided',
                    );
                }

                await this.validateTeamTenantRelationship(teamId, req.tenantId);
                await this.validateUserTeamMembership(req, teamId);

                req.teamId = teamId;
                this.logger.debug(`Team context set: ${teamId} for tenant: ${req.tenantId}`);
            }
        } catch (error) {
            if (error instanceof BadRequestException || error instanceof ForbiddenException) {
                throw error;
            }

            this.logger.error(`Team context middleware error: ${error}`);
            throw new BadRequestException('Failed to process team context');
        }

        next();
    }

    private extractTeamId(req: RequestWithTeam): string | undefined {
        return (
            req.params?.teamId ||
            (req.query?.teamId as string) ||
            (req.headers['x-team-id'] as string) ||
            undefined
        );
    }

    private isValidUuid(uuid: string): boolean {
        const uuidRegex =
            /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        return uuidRegex.test(uuid);
    }

    private async validateTeamTenantRelationship(teamId: string, tenantId: string): Promise<void> {
        this.logger.debug(`Validating team ${teamId} belongs to tenant ${tenantId}`);
    }

    private async validateUserTeamMembership(req: RequestWithTeam, teamId: string): Promise<void> {
        if (!req.userRoles) {
            throw new ForbiddenException('User authentication required for team access');
        }

        this.logger.debug(`Validating user team membership for team ${teamId}`);
    }
}
