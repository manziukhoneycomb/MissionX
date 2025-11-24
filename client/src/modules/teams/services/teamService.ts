import axios from 'axios';
import { Team, CreateTeamRequest, UpdateTeamRequest, ManageTeamUsersRequest } from '../types/team';

export const getTeams = () => axios.get<Team[]>('/teams');

export const getTeamById = (id: string) => axios.get<Team>(`/teams/${id}`);

export const createTeam = (teamData: CreateTeamRequest) => axios.post<Team>('/teams', teamData);

export const updateTeam = (id: string, teamData: UpdateTeamRequest) => 
  axios.patch<Team>(`/teams/${id}`, teamData);

export const deleteTeam = (id: string) => axios.delete(`/teams/${id}`);

export const addUsersToTeam = (teamId: string, data: ManageTeamUsersRequest) => 
  axios.post<Team>(`/teams/${teamId}/users`, data);

export const removeUsersFromTeam = (teamId: string, data: ManageTeamUsersRequest) => 
  axios.delete<Team>(`/teams/${teamId}/users`, { data });