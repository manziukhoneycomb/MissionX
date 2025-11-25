import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { Team, CreateTeamRequest, UpdateTeamRequest, AddMemberRequest } from './types/team';
import { teamQueryKeys } from './teamQueryKeys';

export const createTeam = (data: CreateTeamRequest) => axios.post<Team>('/teams', data);

export const updateTeam = (id: string, data: UpdateTeamRequest) =>
  axios.patch<Team>(`/teams/${id}`, data);

export const deleteTeam = (id: string) => axios.delete(`/teams/${id}`);

export const addTeamMember = (teamId: string, data: AddMemberRequest) =>
  axios.post(`/teams/${teamId}/members`, data);

export const removeTeamMember = (teamId: string, userId: string) =>
  axios.delete(`/teams/${teamId}/members/${userId}`);

export const useCreateTeam = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createTeam,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: teamQueryKeys.lists() });
    },
  });
};

export const useUpdateTeam = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTeamRequest }) => updateTeam(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: teamQueryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: teamQueryKeys.detail(variables.id) });
    },
  });
};

export const useDeleteTeam = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteTeam,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: teamQueryKeys.lists() });
    },
  });
};

export const useAddTeamMember = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ teamId, data }: { teamId: string; data: AddMemberRequest }) =>
      addTeamMember(teamId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: teamQueryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: teamQueryKeys.detail(variables.teamId) });
      queryClient.invalidateQueries({ queryKey: teamQueryKeys.members(variables.teamId) });
    },
  });
};

export const useRemoveTeamMember = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ teamId, userId }: { teamId: string; userId: string }) =>
      removeTeamMember(teamId, userId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: teamQueryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: teamQueryKeys.detail(variables.teamId) });
      queryClient.invalidateQueries({ queryKey: teamQueryKeys.members(variables.teamId) });
    },
  });
};
