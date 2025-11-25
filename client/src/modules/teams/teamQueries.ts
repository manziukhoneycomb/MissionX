import axios from 'axios';
import { Team } from './types/team';

export const getTeams = () => axios.get<Team[]>('/teams');
export const getTeamById = (id: string) => axios.get<Team>(`/teams/${id}`);
