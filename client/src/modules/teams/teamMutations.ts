import axios from 'axios';
import { Team, CreateTeamInput, UpdateTeamInput, AddTeamMemberInput } from './types/team';

export type UpdateTeamPayload = {
  id: string;
  data: UpdateTeamInput;
};

export const createTeam = (teamData: CreateTeamInput) => axios.post<Team>('/teams', teamData);

export const updateTeam = (teamPayload: UpdateTeamPayload) =>
  axios.patch<Team>(`/teams/${teamPayload.id}`, teamPayload.data);

export const deleteTeam = (id: string) => axios.delete(`/teams/${id}`);

export const addTeamMember = (teamId: string, memberData: AddTeamMemberInput) =>
  axios.post(`/teams/${teamId}/members`, memberData);

export const removeTeamMember = (teamId: string, userId: string) =>
  axios.delete(`/teams/${teamId}/members/${userId}`);
