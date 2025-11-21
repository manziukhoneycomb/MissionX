import axios from 'axios';
import { Team, TeamMember, TeamRole } from './types/team';

export const getTeams = async () => axios.get<Team[]>('/teams');

export const getTeam = async (id: string) => axios.get<Team>(`/teams/${id}`);

export const getTeamMembers = async (teamId: string) =>
  axios.get<TeamMember[]>(`/teams/${teamId}/members`);

export const getTeamRoles = async () => axios.get<TeamRole[]>('/teams/roles');