import axios from 'axios';
import { Team, CreateTeamInput, UpdateTeamInput, AddTeamMemberInput } from '../types/team';

export const getTeams = () => axios.get<Team[]>('/teams');

export const getTeam = (id: string) => axios.get<Team>(`/teams/${id}`);

export const createTeam = (teamData: CreateTeamInput) => 
  axios.post<Team>('/teams', teamData);

export const updateTeam = (id: string, teamData: UpdateTeamInput) => 
  axios.patch<Team>(`/teams/${id}`, teamData);

export const deleteTeam = (id: string) => 
  axios.delete(`/teams/${id}`);

export const addTeamMember = (teamId: string, memberData: AddTeamMemberInput) => 
  axios.post(`/teams/${teamId}/members`, memberData);

export const removeTeamMember = (teamId: string, userId: string) => 
  axios.delete(`/teams/${teamId}/members/${userId}`);

export const getTeamMembers = (teamId: string) => 
  axios.get<Team>(`/teams/${teamId}/members`);