import axios from 'axios';
import {
  CreateTeamInput,
  UpdateTeamInput,
  AddTeamMemberInput,
  UpdateTeamMemberInput,
  Team,
  TeamMember,
} from './types/team';

export const createTeam = (data: CreateTeamInput) =>
  axios.post<Team>('/teams', data);

export const updateTeam = (id: string, data: UpdateTeamInput) =>
  axios.patch<Team>(`/teams/${id}`, data);

export const deleteTeam = (id: string) =>
  axios.delete(`/teams/${id}`);

export const addTeamMember = (teamId: string, data: AddTeamMemberInput) =>
  axios.post<TeamMember>(`/teams/${teamId}/members`, data);

export const updateTeamMember = (teamId: string, memberId: string, data: UpdateTeamMemberInput) =>
  axios.patch<TeamMember>(`/teams/${teamId}/members/${memberId}`, data);

export const removeTeamMember = (teamId: string, memberId: string) =>
  axios.delete(`/teams/${teamId}/members/${memberId}`);