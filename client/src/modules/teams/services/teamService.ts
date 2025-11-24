import axios from 'axios';
import { Team, CreateTeamInput, UpdateTeamInput, AddTeamMembersInput, RemoveTeamMembersInput } from '../types/team';

export const teamService = {
  getTeams: () => axios.get<Team[]>('/teams'),

  getTeamById: (id: string) => axios.get<Team>(`/teams/${id}`),

  createTeam: (data: CreateTeamInput) => axios.post<Team>('/teams', data),

  updateTeam: (id: string, data: UpdateTeamInput) => axios.patch<Team>(`/teams/${id}`, data),

  deleteTeam: (id: string) => axios.delete(`/teams/${id}`),

  addTeamMembers: (teamId: string, data: AddTeamMembersInput) =>
    axios.post<Team>(`/teams/${teamId}/members`, data),

  removeTeamMembers: (teamId: string, data: RemoveTeamMembersInput) =>
    axios.delete<Team>(`/teams/${teamId}/members`, { data }),
};