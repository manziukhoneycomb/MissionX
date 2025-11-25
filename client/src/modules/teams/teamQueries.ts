import axios from 'axios';
import { Team, TeamMember } from './types/team';

export const getTeams = () => axios.get<Team[]>('/teams');

export const getTeamById = (id: string) => axios.get<Team>(`/teams/${id}`);

export const getTeamMembers = (teamId: string) =>
  axios.get<TeamMember[]>(`/teams/${teamId}/members`);
