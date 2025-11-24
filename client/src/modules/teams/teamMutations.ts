import { useMutation, useQueryClient } from '@tanstack/react-query';
import { teamService } from './services/teamService';
import { teamQueryKeys } from './teamQueryKeys';
import { CreateTeamInput, UpdateTeamInput, AddTeamMemberInput } from './types/team';

export const useCreateTeam = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateTeamInput) => teamService.createTeam(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: teamQueryKeys.all });
    },
  });
};

export const useUpdateTeam = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTeamInput }) =>
      teamService.updateTeam(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: teamQueryKeys.all });
      queryClient.invalidateQueries({ queryKey: teamQueryKeys.detail(data.id) });
    },
  });
};

export const useDeleteTeam = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => teamService.deleteTeam(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: teamQueryKeys.all });
    },
  });
};

export const useAddTeamMember = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ teamId, data }: { teamId: string; data: AddTeamMemberInput }) =>
      teamService.addMember(teamId, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: teamQueryKeys.detail(data.id) });
      queryClient.invalidateQueries({ queryKey: teamQueryKeys.all });
    },
  });
};

export const useRemoveTeamMember = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ teamId, userId }: { teamId: string; userId: string }) =>
      teamService.removeMember(teamId, userId),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: teamQueryKeys.detail(data.id) });
      queryClient.invalidateQueries({ queryKey: teamQueryKeys.all });
    },
  });
};
