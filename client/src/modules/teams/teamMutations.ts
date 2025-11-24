import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useSnackbar } from 'notistack';
import { teamService } from './services/teamService';
import { CreateTeamInput, UpdateTeamInput, AddTeamMemberInput } from './types/team';
import { TEAM_QUERY_KEYS } from './teamQueryKeys';

export const useCreateTeam = () => {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation({
    mutationFn: (input: CreateTeamInput) => teamService.createTeam(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [TEAM_QUERY_KEYS.GET_TEAMS] });
      enqueueSnackbar('Team created successfully', { variant: 'success' });
    },
    onError: () => {
      enqueueSnackbar('Failed to create team', { variant: 'error' });
    },
  });
};

export const useUpdateTeam = () => {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateTeamInput }) =>
      teamService.updateTeam(id, input),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: [TEAM_QUERY_KEYS.GET_TEAMS] });
      queryClient.invalidateQueries({ queryKey: [TEAM_QUERY_KEYS.GET_TEAM, variables.id] });
      enqueueSnackbar('Team updated successfully', { variant: 'success' });
    },
    onError: () => {
      enqueueSnackbar('Failed to update team', { variant: 'error' });
    },
  });
};

export const useDeleteTeam = () => {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation({
    mutationFn: (id: string) => teamService.deleteTeam(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [TEAM_QUERY_KEYS.GET_TEAMS] });
      enqueueSnackbar('Team deleted successfully', { variant: 'success' });
    },
    onError: () => {
      enqueueSnackbar('Failed to delete team', { variant: 'error' });
    },
  });
};

export const useAddTeamMember = () => {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation({
    mutationFn: ({ teamId, input }: { teamId: string; input: AddTeamMemberInput }) =>
      teamService.addMember(teamId, input),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: [TEAM_QUERY_KEYS.GET_TEAMS] });
      queryClient.invalidateQueries({ queryKey: [TEAM_QUERY_KEYS.GET_TEAM, variables.teamId] });
      enqueueSnackbar('Member added successfully', { variant: 'success' });
    },
    onError: () => {
      enqueueSnackbar('Failed to add member', { variant: 'error' });
    },
  });
};

export const useRemoveTeamMember = () => {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation({
    mutationFn: ({ teamId, userId }: { teamId: string; userId: string }) =>
      teamService.removeMember(teamId, userId),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: [TEAM_QUERY_KEYS.GET_TEAMS] });
      queryClient.invalidateQueries({ queryKey: [TEAM_QUERY_KEYS.GET_TEAM, variables.teamId] });
      enqueueSnackbar('Member removed successfully', { variant: 'success' });
    },
    onError: () => {
      enqueueSnackbar('Failed to remove member', { variant: 'error' });
    },
  });
};