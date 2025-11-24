import { useMutation, useQueryClient } from '@tanstack/react-query';
import { teamService } from './services/teamService';
import { teamKeys } from './teamQueryKeys';
import { CreateTeamInput, UpdateTeamInput, AddTeamMembersInput, RemoveTeamMembersInput } from './types/team';

export const useCreateTeam = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateTeamInput) => teamService.createTeam(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: teamKeys.lists(),
      });
    },
  });
};

export const useUpdateTeam = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTeamInput }) =>
      teamService.updateTeam(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: teamKeys.lists(),
      });
      queryClient.invalidateQueries({
        queryKey: teamKeys.detail(variables.id),
      });
    },
  });
};

export const useDeleteTeam = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => teamService.deleteTeam(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: teamKeys.lists(),
      });
    },
  });
};

export const useAddTeamMembers = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ teamId, data }: { teamId: string; data: AddTeamMembersInput }) =>
      teamService.addTeamMembers(teamId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: teamKeys.detail(variables.teamId),
      });
    },
  });
};

export const useRemoveTeamMembers = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ teamId, data }: { teamId: string; data: RemoveTeamMembersInput }) =>
      teamService.removeTeamMembers(teamId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: teamKeys.detail(variables.teamId),
      });
    },
  });
};