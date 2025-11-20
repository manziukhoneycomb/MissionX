import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useSnackbar } from 'notistack';
import {
  createTeam,
  updateTeam,
  deleteTeam,
  addTeamMember,
  updateTeamMember,
  removeTeamMember,
  activateTeam,
  deactivateTeam,
} from '../teamMutations';
import { TEAM_QUERY_KEYS } from '../teamQueryKeys';

export const useCreateTeam = () => {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation({
    mutationFn: createTeam,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [TEAM_QUERY_KEYS.GET_TEAMS] });
      enqueueSnackbar('Team created successfully', { variant: 'success' });
    },
    onError: (error: Error) => {
      enqueueSnackbar(error.message || 'Failed to create team', { variant: 'error' });
    },
  });
};

export const useUpdateTeam = () => {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation({
    mutationFn: updateTeam,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [TEAM_QUERY_KEYS.GET_TEAMS] });
      queryClient.invalidateQueries({ queryKey: [TEAM_QUERY_KEYS.GET_TEAM] });
      enqueueSnackbar('Team updated successfully', { variant: 'success' });
    },
    onError: (error: Error) => {
      enqueueSnackbar(error.message || 'Failed to update team', { variant: 'error' });
    },
  });
};

export const useDeleteTeam = () => {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation({
    mutationFn: deleteTeam,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [TEAM_QUERY_KEYS.GET_TEAMS] });
      enqueueSnackbar('Team deleted successfully', { variant: 'success' });
    },
    onError: (error: Error) => {
      enqueueSnackbar(error.message || 'Failed to delete team', { variant: 'error' });
    },
  });
};

export const useAddTeamMember = () => {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation({
    mutationFn: addTeamMember,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [TEAM_QUERY_KEYS.GET_TEAMS] });
      queryClient.invalidateQueries({ queryKey: [TEAM_QUERY_KEYS.GET_TEAM] });
      queryClient.invalidateQueries({ queryKey: [TEAM_QUERY_KEYS.GET_TEAM_MEMBERS] });
      enqueueSnackbar('Member added successfully', { variant: 'success' });
    },
    onError: (error: Error) => {
      enqueueSnackbar(error.message || 'Failed to add member', { variant: 'error' });
    },
  });
};

export const useUpdateTeamMember = () => {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation({
    mutationFn: updateTeamMember,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [TEAM_QUERY_KEYS.GET_TEAMS] });
      queryClient.invalidateQueries({ queryKey: [TEAM_QUERY_KEYS.GET_TEAM] });
      queryClient.invalidateQueries({ queryKey: [TEAM_QUERY_KEYS.GET_TEAM_MEMBERS] });
      enqueueSnackbar('Member role updated successfully', { variant: 'success' });
    },
    onError: (error: Error) => {
      enqueueSnackbar(error.message || 'Failed to update member role', { variant: 'error' });
    },
  });
};

export const useRemoveTeamMember = () => {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation({
    mutationFn: removeTeamMember,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [TEAM_QUERY_KEYS.GET_TEAMS] });
      queryClient.invalidateQueries({ queryKey: [TEAM_QUERY_KEYS.GET_TEAM] });
      queryClient.invalidateQueries({ queryKey: [TEAM_QUERY_KEYS.GET_TEAM_MEMBERS] });
      enqueueSnackbar('Member removed successfully', { variant: 'success' });
    },
    onError: (error: Error) => {
      enqueueSnackbar(error.message || 'Failed to remove member', { variant: 'error' });
    },
  });
};

export const useToggleTeamStatus = () => {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation({
    mutationFn: ({ id, activate }: { id: string; activate: boolean }) =>
      activate ? activateTeam(id) : deactivateTeam(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [TEAM_QUERY_KEYS.GET_TEAMS] });
      queryClient.invalidateQueries({ queryKey: [TEAM_QUERY_KEYS.GET_TEAM] });
      enqueueSnackbar('Team status updated successfully', { variant: 'success' });
    },
    onError: (error: Error) => {
      enqueueSnackbar(error.message || 'Failed to update team status', { variant: 'error' });
    },
  });
};