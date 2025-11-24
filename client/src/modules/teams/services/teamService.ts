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

  createTeam: async (input: CreateTeamInput): Promise<Team> => {
    const response = await axios.post<Team>('/teams', input);
    return response.data;
  },

  updateTeam: async (id: string, input: UpdateTeamInput): Promise<Team> => {
    const response = await axios.patch<Team>(`/teams/${id}`, input);
    return response.data;
  },

  deleteTeam: async (id: string): Promise<void> => {
    await axios.delete(`/teams/${id}`);
  },

  addMember: async (teamId: string, input: AddTeamMemberInput): Promise<Team> => {
    const response = await axios.post<Team>(`/teams/${teamId}/members`, input);
    return response.data;
  },

  removeMember: async (teamId: string, userId: string): Promise<Team> => {
    const response = await axios.delete<Team>(`/teams/${teamId}/members/${userId}`);
    return response.data;
  },
};