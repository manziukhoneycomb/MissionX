import { useQuery } from '@tanstack/react-query';
import { teamKeys } from './teamQueryKeys';
import { teamService } from './services/teamService';

export const useGetTeams = () => {
  return useQuery({
    queryKey: teamKeys.list(),
    queryFn: async () => {
      const response = await teamService.getTeams();
      return response.data;
    },
  });
};

export const useGetTeamById = (id: string) => {
  return useQuery({
    queryKey: teamKeys.detail(id),
    queryFn: async () => {
      const response = await teamService.getTeamById(id);
      return response.data;
    },
    enabled: !!id,
  });
};