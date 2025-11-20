import axios from 'axios';
import { Team, TeamMember } from './types/team';
import { RoleValue } from '../../common/constants/roles';

export type CreateTeamInput = {
  name: string;
  description?: string;
};

export type UpdateTeamInput = {
  name?: string;
  description?: string;
};

export type UpdateTeamPayload = {
  id: string;
  data: UpdateTeamInput;
};

export type AddTeamMemberInput = {
  teamId: string;
  userId: string;
  role: RoleValue;
};

export type UpdateTeamMemberRoleInput = {
  teamId: string;
  userId: string;
  role: RoleValue;
};

export type RemoveTeamMemberInput = {
  teamId: string;
  userId: string;
};

export const createTeam = (teamData: CreateTeamInput) => axios.post<Team>('/teams', teamData);

export const updateTeam = (teamPayload: UpdateTeamPayload) =>
  axios.patch<Team>(`/teams/${teamPayload.id}`, teamPayload.data);

export const deleteTeam = (id: string) => axios.delete(`/teams/${id}`);

export const addTeamMember = (memberData: AddTeamMemberInput) =>
  axios.post<TeamMember>(`/teams/${memberData.teamId}/members`, {
    userId: memberData.userId,
    role: memberData.role,
  });

export const updateTeamMemberRole = (memberData: UpdateTeamMemberRoleInput) =>
  axios.patch<TeamMember>(`/teams/${memberData.teamId}/members/${memberData.userId}`, {
    role: memberData.role,
  });

export const removeTeamMember = (memberData: RemoveTeamMemberInput) =>
  axios.delete(`/teams/${memberData.teamId}/members/${memberData.userId}`);