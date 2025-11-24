import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useSnackbar } from 'notistack';
import { 
  createTeam, 
  updateTeam, 
  deleteTeam,
  addUsersToTeam,
  removeUsersFromTeam
} from './services/teamService';
import { teamQueryKeys } from './teamQueryKeys';
import { CreateTeamRequest, UpdateTeamRequest, ManageTeamUsersRequest } from './types/team';

export const useCreateTeam = () => {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation({
    mutationFn: (data: CreateTeamRequest) => createTeam(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: teamQueryKeys.all });
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
    mutationFn: ({ id, data }: { id: string; data: UpdateTeamRequest }) => 
      updateTeam(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: teamQueryKeys.all });
      queryClient.invalidateQueries({ queryKey: teamQueryKeys.detail(variables.id) });
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
    mutationFn: (id: string) => deleteTeam(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: teamQueryKeys.all });
      enqueueSnackbar('Team deleted successfully', { variant: 'success' });
    },
    onError: () => {
      enqueueSnackbar('Failed to delete team', { variant: 'error' });
    },
  });
};

export const useAddUsersToTeam = () => {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation({
    mutationFn: ({ teamId, data }: { teamId: string; data: ManageTeamUsersRequest }) => 
      addUsersToTeam(teamId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: teamQueryKeys.all });
      queryClient.invalidateQueries({ queryKey: teamQueryKeys.detail(variables.teamId) });
      enqueueSnackbar('Users added to team successfully', { variant: 'success' });
    },
    onError: () => {
      enqueueSnackbar('Failed to add users to team', { variant: 'error' });
    },
  });
};

export const useRemoveUsersFromTeam = () => {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation({
    mutationFn: ({ teamId, data }: { teamId: string; data: ManageTeamUsersRequest }) => 
      removeUsersFromTeam(teamId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: teamQueryKeys.all });
      queryClient.invalidateQueries({ queryKey: teamQueryKeys.detail(variables.teamId) });
      enqueueSnackbar('Users removed from team successfully', { variant: 'success' });
    },
    onError: () => {
      enqueueSnackbar('Failed to remove users from team', { variant: 'error' });
    },
  });
};