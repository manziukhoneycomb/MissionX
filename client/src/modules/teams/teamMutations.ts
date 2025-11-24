import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useSnackbar } from 'notistack';
import { teamKeys } from './teamQueryKeys';
import {
  createTeam,
  createTeamBySuperAdmin,
  updateTeam,
  deleteTeam,
  addUsersToTeam,
  removeUsersFromTeam,
} from './services/teamService';
import {
  CreateTeamInput,
  CreateTeamSuperAdminInput,
  UpdateTeamInput,
  ManageTeamUsersInput,
} from './types/team';

export const useCreateTeam = () => {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation({
    mutationFn: (data: CreateTeamInput) => createTeam(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: teamKeys.lists() });
      enqueueSnackbar('Team created successfully', { variant: 'success' });
    },
    onError: (error: Error) => {
      enqueueSnackbar(error.message || 'Failed to create team', { variant: 'error' });
    },
  });
};

export const useCreateTeamBySuperAdmin = () => {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation({
    mutationFn: (data: CreateTeamSuperAdminInput) => createTeamBySuperAdmin(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: teamKeys.lists() });
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
    mutationFn: ({ id, data }: { id: string; data: UpdateTeamInput }) => updateTeam(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: teamKeys.lists() });
      queryClient.invalidateQueries({ queryKey: teamKeys.detail(variables.id) });
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
    mutationFn: (id: string) => deleteTeam(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: teamKeys.lists() });
      enqueueSnackbar('Team deleted successfully', { variant: 'success' });
    },
    onError: (error: Error) => {
      enqueueSnackbar(error.message || 'Failed to delete team', { variant: 'error' });
    },
  });
};

export const useAddUsersToTeam = () => {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation({
    mutationFn: ({ teamId, data }: { teamId: string; data: ManageTeamUsersInput }) =>
      addUsersToTeam(teamId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: teamKeys.detail(variables.teamId) });
      queryClient.invalidateQueries({ queryKey: teamKeys.users(variables.teamId) });
      queryClient.invalidateQueries({ queryKey: teamKeys.lists() });
      enqueueSnackbar('Users added to team successfully', { variant: 'success' });
    },
    onError: (error: Error) => {
      enqueueSnackbar(error.message || 'Failed to add users to team', { variant: 'error' });
    },
  });
};

export const useRemoveUsersFromTeam = () => {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation({
    mutationFn: ({ teamId, data }: { teamId: string; data: ManageTeamUsersInput }) =>
      removeUsersFromTeam(teamId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: teamKeys.detail(variables.teamId) });
      queryClient.invalidateQueries({ queryKey: teamKeys.users(variables.teamId) });
      queryClient.invalidateQueries({ queryKey: teamKeys.lists() });
      enqueueSnackbar('Users removed from team successfully', { variant: 'success' });
    },
    onError: (error: Error) => {
      enqueueSnackbar(error.message || 'Failed to remove users from team', { variant: 'error' });
    },
  });
};