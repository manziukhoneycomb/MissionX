import axios from 'axios';
import { Team } from '../types/team';

export interface PaginatedResponseDto<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CreateTeamDto {
  name: string;
  description: string;
  tenantId?: string;
}

export interface UpdateTeamDto {
  name?: string;
  description?: string;
}

export interface ManageTeamMembersDto {
  userIds: string[];
}

export const teamService = {
  getTeams: async (page: number = 1, limit: number = 10): Promise<PaginatedResponseDto<Team>> => {
    const response = await axios.get<PaginatedResponseDto<Team>>('/teams', {
      params: { page, limit }
    });
    return response.data;
  },

  getTeamById: async (id: string): Promise<Team> => {
    const response = await axios.get<Team>(`/teams/${id}`);
    return response.data;
  },

  createTeam: async (teamData: CreateTeamDto): Promise<Team> => {
    const response = await axios.post<Team>('/teams', teamData);
    return response.data;
  },

  updateTeam: async (id: string, teamData: UpdateTeamDto): Promise<Team> => {
    const response = await axios.patch<Team>(`/teams/${id}`, teamData);
    return response.data;
  },

  deleteTeam: async (id: string): Promise<void> => {
    await axios.delete(`/teams/${id}`);
  },

  updateTeamMembers: async (id: string, userIds: string[]): Promise<Team> => {
    const response = await axios.put<Team>(`/teams/${id}/members`, { userIds });
    return response.data;
  }
};