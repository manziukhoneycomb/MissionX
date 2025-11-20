import axios from 'axios';
import { Team, TeamRole, TeamPermission } from './types/team';

export const getTeams = () => axios.get<Team[]>('/teams');
export const getTeamById = (id: string) => axios.get<Team>(`/teams/${id}`);
export const getTeamRoles = () => axios.get<TeamRole[]>('/teams/roles');
export const getTeamPermissions = () => axios.get<TeamPermission[]>('/teams/permissions');