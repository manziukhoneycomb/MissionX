import axios from 'axios';
import { 
  Team, 
  TeamMember, 
  CreateTeamInput, 
  CreateTeamSuperAdminInput, 
  UpdateTeamInput, 
  ManageTeamUsersInput 
} from '../types/team';

export const getTeams = () => axios.get<Team[]>('/teams');

export const getTeamById = (id: string) => axios.get<Team>(`/teams/${id}`);

export const getTeamUsers = (id: string) => axios.get<TeamMember[]>(`/teams/${id}/users`);

export const createTeam = (teamData: CreateTeamInput) => axios.post<Team>('/teams', teamData);

export const createTeamBySuperAdmin = (teamData: CreateTeamSuperAdminInput) =>
  axios.post<Team>('/teams/super', teamData);

export const updateTeam = (id: string, data: UpdateTeamInput) =>
  axios.patch<Team>(`/teams/${id}`, data);

export const deleteTeam = (id: string) => axios.delete(`/teams/${id}`);

export const addUsersToTeam = (teamId: string, data: ManageTeamUsersInput) =>
  axios.post<Team>(`/teams/${teamId}/users`, data);

export const removeUsersFromTeam = (teamId: string, data: ManageTeamUsersInput) =>
  axios.delete<Team>(`/teams/${teamId}/users`, { data });