import apiClient from '../../../common/services/apiClient';
import { Team, CreateTeamInput, UpdateTeamInput } from '../types/team';

export const getTeams = async (): Promise<Team[]> => {
  const response = await apiClient.get('/teams');
  return response.data;
};

export const getTeam = async (id: string): Promise<Team> => {
  const response = await apiClient.get(`/teams/${id}`);
  return response.data;
};

export const createTeam = async (data: CreateTeamInput): Promise<Team> => {
  const response = await apiClient.post('/teams', data);
  return response.data;
};

export const updateTeam = async (id: string, data: UpdateTeamInput): Promise<Team> => {
  const response = await apiClient.patch(`/teams/${id}`, data);
  return response.data;
};

export const deleteTeam = async (id: string): Promise<void> => {
  await apiClient.delete(`/teams/${id}`);
};

export const addTeamMember = async (teamId: string, userId: string): Promise<Team> => {
  const response = await apiClient.post(`/teams/${teamId}/members`, { userId });
  return response.data;
};

export const removeTeamMember = async (teamId: string, userId: string): Promise<Team> => {
  const response = await apiClient.delete(`/teams/${teamId}/members/${userId}`);
  return response.data;
};
