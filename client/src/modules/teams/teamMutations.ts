import axios from 'axios';
import { 
  Team, 
  CreateTeamInput, 
  UpdateTeamInput, 
  AddTeamMemberInput, 
  UpdateTeamMemberInput 
} from './types/team';

export type UpdateTeamPayload = {
  id: string;
  data: UpdateTeamInput;
};

export type AddTeamMemberPayload = {
  teamId: string;
  data: AddTeamMemberInput;
};

export type UpdateTeamMemberPayload = {
  teamId: string;
  userId: string;
  data: UpdateTeamMemberInput;
};

export type RemoveTeamMemberPayload = {
  teamId: string;
  userId: string;
};

export const createTeam = (teamData: CreateTeamInput) => 
  axios.post<Team>('/teams', teamData);

export const updateTeam = (payload: UpdateTeamPayload) =>
  axios.patch<Team>(`/teams/${payload.id}`, payload.data);

export const deleteTeam = (id: string) => axios.delete(`/teams/${id}`);

export const addTeamMember = (payload: AddTeamMemberPayload) =>
  axios.post(`/teams/${payload.teamId}/members`, payload.data);

export const updateTeamMember = (payload: UpdateTeamMemberPayload) =>
  axios.patch(`/teams/${payload.teamId}/members/${payload.userId}`, payload.data);

export const removeTeamMember = (payload: RemoveTeamMemberPayload) =>
  axios.delete(`/teams/${payload.teamId}/members/${payload.userId}`);

export const activateTeam = (id: string) => axios.patch(`/teams/${id}/activate`);
export const deactivateTeam = (id: string) => axios.patch(`/teams/${id}/deactivate`);