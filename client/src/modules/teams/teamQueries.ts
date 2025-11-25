import { useQuery } from '@tanstack/react-query';
import { getTeams, getTeam, getTeamMembers } from './services/teamService';
import { teamQueryKeys } from './teamQueryKeys';

export const useTeams = () => {
  return useQuery({
    queryKey: teamQueryKeys.lists(),
    queryFn: async () => {
      const response = await getTeams();
      return response.data;
    },
  });
};

export const useTeam = (id: string) => {
  return useQuery({
    queryKey: teamQueryKeys.detail(id),
    queryFn: async () => {
      const response = await getTeam(id);
      return response.data;
    },
    enabled: !!id,
  });
};

export const useTeamMembers = (id: string) => {
  return useQuery({
    queryKey: teamQueryKeys.members(id),
    queryFn: async () => {
      const response = await getTeamMembers(id);
      return response.data;
    },
    enabled: !!id,
  });
};