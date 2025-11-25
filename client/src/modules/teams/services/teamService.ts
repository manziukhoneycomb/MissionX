import axios from 'axios';
import { CreateTeamInput, Team, UpdateTeamInput } from '../types/team';

const BASE_URL = '/api/teams';

export const getTeams = async (): Promise<Team[]> => {
  const { data } = await axios.get<Team[]>(BASE_URL);
  return data;
};

export const createTeam = async (input: CreateTeamInput): Promise<Team> => {
  const { data } = await axios.post<Team>(BASE_URL, input);
  return data;
};

export const updateTeam = async (id: string, input: UpdateTeamInput): Promise<Team> => {
  const { data } = await axios.patch<Team>(`${BASE_URL}/${id}`, input);
  return data;
};

export const deleteTeam = async (id: string): Promise<void> => {
  await axios.delete(`${BASE_URL}/${id}`);
};

export const addTeamMember = async (teamId: string, userId: string): Promise<void> => {
  await axios.post(`${BASE_URL}/${teamId}/members`, { userId });
};

export const removeTeamMember = async (teamId: string, userId: string): Promise<void> => {
  await axios.delete(`${BASE_URL}/${teamId}/members/${userId}`);
};
