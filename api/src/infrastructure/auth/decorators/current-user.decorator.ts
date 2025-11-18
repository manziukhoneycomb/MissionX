import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { RequestWithTeam } from '../../middleware/request-with-team.interface';
import { RoleName } from '../../../domain/enums/role-name.enum';

export interface UserContext {
    roles: RoleName[];
    tenantId?: string;
    teamContext?: {
        teamId: string;
        teamRoles: RoleName[];
        isTeamMember: boolean;
    };
}

export const CurrentUser = createParamDecorator(
    (data: string | undefined, ctx: ExecutionContext): any => {
        const request: RequestWithTeam = ctx.switchToHttp().getRequest();
        
        const userContext: UserContext = {
            roles: request.userRoles || [],
            tenantId: request.tenantId,
            teamContext: request.teamContext,
        };
        
        if (data) {
            return userContext[data as keyof UserContext];
        }
        
        return userContext;
    },
);