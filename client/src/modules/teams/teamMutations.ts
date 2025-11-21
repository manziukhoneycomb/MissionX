import axios from 'axios';
import {
  Team,
  TeamMember,
  CreateTeamInput,
  UpdateTeamInput,
  AddTeamMemberInput,
  UpdateTeamMemberInput,
} from './types/team';

export const createTeam = async (data: CreateTeamInput) =>
  axios.post<Team>('/teams', data);

export const updateTeam = async ({ id, data }: { id: string; data: UpdateTeamInput }) =>
  axios.put<Team>(`/teams/${id}`, data);

export const deleteTeam = async (id: string) =>
  axios.delete(`/teams/${id}`);

export const addTeamMember = async ({ teamId, data }: { teamId: string; data: AddTeamMemberInput }) =>
  axios.post<TeamMember>(`/teams/${teamId}/members`, data);

export const updateTeamMember = async ({
  teamId,
  userId,
  data,
}: {
  teamId: string;
  userId: string;
  data: UpdateTeamMemberInput;
}) =>
  axios.put<TeamMember>(`/teams/${teamId}/members/${userId}`, data);

export const removeTeamMember = async ({ teamId, userId }: { teamId: string; userId: string }) =>
  axios.delete(`/teams/${teamId}/members/${userId}`);