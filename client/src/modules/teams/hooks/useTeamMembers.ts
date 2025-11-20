import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useSnackbar } from 'notistack';
import { TEAM_QUERY_KEYS } from '../teamQueryKeys';
import {
  addTeamMember,
  updateTeamMember,
  removeTeamMember,
} from '../teamMutations';
import { AddTeamMemberInput, UpdateTeamMemberInput } from '../types/team';

export const useAddTeamMember = () => {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation({
    mutationFn: ({ teamId, data }: { teamId: string; data: AddTeamMemberInput }) =>
      addTeamMember(teamId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [TEAM_QUERY_KEYS.GET_TEAMS] });
      queryClient.invalidateQueries({ queryKey: [TEAM_QUERY_KEYS.GET_TEAM] });
      enqueueSnackbar('Team member added successfully', { variant: 'success' });
    },
    onError: (error: any) => {
      enqueueSnackbar(error.response?.data?.message || 'Failed to add team member', {
        variant: 'error',
      });
    },
  });
};

export const useUpdateTeamMember = () => {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation({
    mutationFn: ({
      teamId,
      memberId,
      data,
    }: {
      teamId: string;
      memberId: string;
      data: UpdateTeamMemberInput
    }) => updateTeamMember(teamId, memberId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [TEAM_QUERY_KEYS.GET_TEAMS] });
      queryClient.invalidateQueries({ queryKey: [TEAM_QUERY_KEYS.GET_TEAM] });
      enqueueSnackbar('Team member updated successfully', { variant: 'success' });
    },
    onError: (error: any) => {
      enqueueSnackbar(error.response?.data?.message || 'Failed to update team member', {
        variant: 'error',
      });
    },
  });
};

export const useRemoveTeamMember = () => {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation({
    mutationFn: ({ teamId, memberId }: { teamId: string; memberId: string }) =>
      removeTeamMember(teamId, memberId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [TEAM_QUERY_KEYS.GET_TEAMS] });
      queryClient.invalidateQueries({ queryKey: [TEAM_QUERY_KEYS.GET_TEAM] });
      enqueueSnackbar('Team member removed successfully', { variant: 'success' });
    },
    onError: (error: any) => {
      enqueueSnackbar(error.response?.data?.message || 'Failed to remove team member', {
        variant: 'error',
      });
    },
  });
};