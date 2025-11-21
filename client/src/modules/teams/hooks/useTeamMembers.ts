import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSnackbar } from 'notistack';
import { CACHE_TIMES } from '../../../common/constants/cacheTimes';
import { TEAM_QUERY_KEYS } from '../teamQueryKeys';
import { getTeamMembers } from '../teamQueries';
import {
  addTeamMember,
  updateTeamMember,
  removeTeamMember,
} from '../teamMutations';
import { AddTeamMemberInput, UpdateTeamMemberInput } from '../types/team';

export const useTeamMembers = (teamId: string) => {
  return useQuery({
    queryKey: [TEAM_QUERY_KEYS.GET_TEAM_MEMBERS, teamId],
    queryFn: () => getTeamMembers(teamId),
    staleTime: CACHE_TIMES.DEFAULT,
    enabled: !!teamId,
  });
};

export const useAddTeamMember = () => {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation({
    mutationFn: ({ teamId, data }: { teamId: string; data: AddTeamMemberInput }) =>
      addTeamMember({ teamId, data }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: [TEAM_QUERY_KEYS.GET_TEAM_MEMBERS, variables.teamId],
      });
      queryClient.invalidateQueries({ queryKey: [TEAM_QUERY_KEYS.GET_TEAMS] });
      enqueueSnackbar('Team member added successfully', { variant: 'success' });
    },
    onError: (error: any) => {
      enqueueSnackbar(error?.response?.data?.message || 'Failed to add team member', {
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
      userId,
      data,
    }: {
      teamId: string;
      userId: string;
      data: UpdateTeamMemberInput;
    }) => updateTeamMember({ teamId, userId, data }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: [TEAM_QUERY_KEYS.GET_TEAM_MEMBERS, variables.teamId],
      });
      queryClient.invalidateQueries({ queryKey: [TEAM_QUERY_KEYS.GET_TEAMS] });
      enqueueSnackbar('Team member updated successfully', { variant: 'success' });
    },
    onError: (error: any) => {
      enqueueSnackbar(error?.response?.data?.message || 'Failed to update team member', {
        variant: 'error',
      });
    },
  });
};

export const useRemoveTeamMember = () => {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation({
    mutationFn: ({ teamId, userId }: { teamId: string; userId: string }) =>
      removeTeamMember({ teamId, userId }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: [TEAM_QUERY_KEYS.GET_TEAM_MEMBERS, variables.teamId],
      });
      queryClient.invalidateQueries({ queryKey: [TEAM_QUERY_KEYS.GET_TEAMS] });
      enqueueSnackbar('Team member removed successfully', { variant: 'success' });
    },
    onError: (error: any) => {
      enqueueSnackbar(error?.response?.data?.message || 'Failed to remove team member', {
        variant: 'error',
      });
    },
  });
};