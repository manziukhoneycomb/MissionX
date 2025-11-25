import { useMutation, useQueryClient } from '@tanstack/react-query';
import { teamQueryKeys } from './teamQueryKeys';
import {
  createTeam,
  deleteTeam,
  updateTeam,
  addTeamMember,
  removeTeamMember,
} from './services/teamService';
import { CreateTeamInput, UpdateTeamInput } from './types/team';

export const useCreateTeam = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateTeamInput) => createTeam(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: teamQueryKeys.all });
    },
  });
};

export const useUpdateTeam = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTeamInput }) =>
      updateTeam(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: teamQueryKeys.all });
    },
  });
};

export const useDeleteTeam = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteTeam(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: teamQueryKeys.all });
    },
  });
};

export const useAddTeamMember = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ teamId, userId }: { teamId: string; userId: string }) =>
      addTeamMember(teamId, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: teamQueryKeys.all });
    },
  });
};

export const useRemoveTeamMember = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ teamId, userId }: { teamId: string; userId: string }) =>
      removeTeamMember(teamId, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: teamQueryKeys.all });
    },
  });
};
