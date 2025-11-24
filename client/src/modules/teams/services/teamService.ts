import axios from 'axios';
import { Team, CreateTeamInput, UpdateTeamInput, AddTeamMemberInput } from '../types/team';

const BASE_URL = '/api/teams';

export const teamService = {
  getTeams: async (): Promise<Team[]> => {
    const response = await axios.get<Team[]>(BASE_URL);
    return response.data;
  },

  getTeam: async (id: string): Promise<Team> => {
    const response = await axios.get<Team>(`${BASE_URL}/${id}`);
    return response.data;
  },

  createTeam: async (data: CreateTeamInput): Promise<Team> => {
    const response = await axios.post<Team>(BASE_URL, data);
    return response.data;
  },

  updateTeam: async (id: string, data: UpdateTeamInput): Promise<Team> => {
    const response = await axios.patch<Team>(`${BASE_URL}/${id}`, data);
    return response.data;
  },

  deleteTeam: async (id: string): Promise<void> => {
    await axios.delete(`${BASE_URL}/${id}`);
  },

  addMember: async (teamId: string, data: AddTeamMemberInput): Promise<void> => {
    await axios.post(`${BASE_URL}/${teamId}/members`, data);
  },

  removeMember: async (teamId: string, userId: string): Promise<void> => {
    await axios.delete(`${BASE_URL}/${teamId}/members/${userId}`);
  },
};
