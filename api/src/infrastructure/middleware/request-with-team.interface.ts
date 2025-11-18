import { Request } from 'express';
import { TeamRoleName } from '../../domain/enums/team-role-name.enum';

export interface RequestWithTeam extends Request {
    teamId?: string;
    userTeamRole?: TeamRoleName;
}