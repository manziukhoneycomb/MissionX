import { useMutation, useQueryClient } from '@tanstack/react-query';
import { teamService, CreateTeamDto, UpdateTeamDto } from './services/teamService';
import { TEAM_QUERY_KEYS } from './teamQueryKeys';

export const useCreateTeam = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (teamData: CreateTeamDto) => teamService.createTeam(teamData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [TEAM_QUERY_KEYS.GET_TEAMS] });
    }
  });
};

export const useUpdateTeam = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTeamDto }) => 
      teamService.updateTeam(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [TEAM_QUERY_KEYS.GET_TEAMS] });
      queryClient.invalidateQueries({ 
        queryKey: [TEAM_QUERY_KEYS.GET_TEAM_BY_ID, variables.id] 
      });
    }
  });
};

export const useDeleteTeam = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => teamService.deleteTeam(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [TEAM_QUERY_KEYS.GET_TEAMS] });
    }
  });
};

export const useManageTeamMembers = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, userIds }: { id: string; userIds: string[] }) => 
      teamService.updateTeamMembers(id, userIds),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [TEAM_QUERY_KEYS.GET_TEAMS] });
      queryClient.invalidateQueries({ 
        queryKey: [TEAM_QUERY_KEYS.GET_TEAM_BY_ID, variables.id] 
      });
    }
  });
};