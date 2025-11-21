import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSnackbar } from 'notistack';
import { CACHE_TIMES } from '../../../common/constants/cacheTimes';
import { TEAM_QUERY_KEYS } from '../teamQueryKeys';
import {
  getTeams,
  getTeam,
  getTeamRoles,
} from '../teamQueries';
import {
  createTeam,
  updateTeam,
  deleteTeam,
} from '../teamMutations';
import { CreateTeamInput, UpdateTeamInput } from '../types/team';

export const useTeams = () => {
  return useQuery({
    queryKey: [TEAM_QUERY_KEYS.GET_TEAMS],
    queryFn: getTeams,
    staleTime: CACHE_TIMES.DEFAULT,
  });
};

export const useTeam = (id: string) => {
  return useQuery({
    queryKey: [TEAM_QUERY_KEYS.GET_TEAM, id],
    queryFn: () => getTeam(id),
    staleTime: CACHE_TIMES.DEFAULT,
    enabled: !!id,
  });
};

export const useTeamRoles = () => {
  return useQuery({
    queryKey: [TEAM_QUERY_KEYS.GET_TEAM_ROLES],
    queryFn: getTeamRoles,
    staleTime: CACHE_TIMES.DEFAULT,
  });
};

export const useCreateTeam = () => {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation({
    mutationFn: (data: CreateTeamInput) => createTeam(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [TEAM_QUERY_KEYS.GET_TEAMS] });
      enqueueSnackbar('Team created successfully', { variant: 'success' });
    },
    onError: (error: any) => {
      enqueueSnackbar(error?.response?.data?.message || 'Failed to create team', {
        variant: 'error',
      });
    },
  });
};

export const useUpdateTeam = () => {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTeamInput }) => updateTeam({ id, data }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [TEAM_QUERY_KEYS.GET_TEAMS] });
      queryClient.invalidateQueries({ queryKey: [TEAM_QUERY_KEYS.GET_TEAM, variables.id] });
      enqueueSnackbar('Team updated successfully', { variant: 'success' });
    },
    onError: (error: any) => {
      enqueueSnackbar(error?.response?.data?.message || 'Failed to update team', {
        variant: 'error',
      });
    },
  });
};

export const useDeleteTeam = () => {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation({
    mutationFn: (id: string) => deleteTeam(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [TEAM_QUERY_KEYS.GET_TEAMS] });
      enqueueSnackbar('Team deleted successfully', { variant: 'success' });
    },
    onError: (error: any) => {
      enqueueSnackbar(error?.response?.data?.message || 'Failed to delete team', {
        variant: 'error',
      });
    },
  });
};