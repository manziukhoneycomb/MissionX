import axios from 'axios';
import { Team, CreateTeamInput, UpdateTeamInput, AddTeamMemberInput } from '../types/team';

export const teamService = {
  getTeams: async (): Promise<Team[]> => {
    const response = await axios.get<Team[]>('/teams');
    return response.data;
  },

  getTeam: async (id: string): Promise<Team> => {
    const response = await axios.get<Team>(`/teams/${id}`);
    return response.data;
  },

  createTeam: async (data: CreateTeamInput): Promise<Team> => {
    const response = await axios.post<Team>('/teams', data);
    return response.data;
  },

  updateTeam: async (id: string, data: UpdateTeamInput): Promise<Team> => {
    const response = await axios.patch<Team>(`/teams/${id}`, data);
    return response.data;
  },

  deleteTeam: async (id: string): Promise<void> => {
    await axios.delete(`/teams/${id}`);
  },

  addMember: async (teamId: string, data: AddTeamMemberInput): Promise<void> => {
    await axios.post(`/teams/${teamId}/members`, data);
  },

  removeMember: async (teamId: string, userId: string): Promise<void> => {
    await axios.delete(`/teams/${teamId}/members/${userId}`);
  },
};
