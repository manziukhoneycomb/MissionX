import axios from 'axios';
import { Team, CreateTeamRequest, UpdateTeamRequest, AddMemberRequest } from './types/team';

export type UpdateTeamPayload = {
  id: string;
  data: UpdateTeamRequest;
};

export type AddMemberPayload = {
  teamId: string;
  userId: string;
};

export type RemoveMemberPayload = {
  teamId: string;
  userId: string;
};

export const createTeam = (teamData: CreateTeamRequest) =>
  axios.post<Team>('/teams', teamData);

export const updateTeam = (payload: UpdateTeamPayload) =>
  axios.patch<Team>(`/teams/${payload.id}`, payload.data);

export const deleteTeam = (id: string) => axios.delete(`/teams/${id}`);

export const addTeamMember = (payload: AddMemberPayload) => {
  const requestData: AddMemberRequest = { userId: payload.userId };
  return axios.post(`/teams/${payload.teamId}/members`, requestData);
};

export const removeTeamMember = (payload: RemoveMemberPayload) =>
  axios.delete(`/teams/${payload.teamId}/members/${payload.userId}`);
