import axios from 'axios';
import { Team, CreateTeamRequest, UpdateTeamRequest, AddMemberRequest } from './types/team';

export type UpdateTeamPayload = {
  id: string;
  data: UpdateTeamRequest;
};

export type AddMemberPayload = {
  teamId: string;
  data: AddMemberRequest;
};

export type RemoveMemberPayload = {
  teamId: string;
  userId: string;
};

export const createTeam = (teamData: CreateTeamRequest) => axios.post<Team>('/teams', teamData);

export const updateTeam = (teamPayload: UpdateTeamPayload) =>
  axios.patch<Team>(`/teams/${teamPayload.id}`, teamPayload.data);

export const deleteTeam = (id: string) => axios.delete(`/teams/${id}`);

export const addTeamMember = (payload: AddMemberPayload) =>
  axios.post(`/teams/${payload.teamId}/members`, payload.data);

export const removeTeamMember = (payload: RemoveMemberPayload) =>
  axios.delete(`/teams/${payload.teamId}/members/${payload.userId}`);
