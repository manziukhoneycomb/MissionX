import { useQuery } from '@tanstack/react-query';
import { getTeams, getTeamById } from './services/teamService';
import { teamQueryKeys } from './teamQueryKeys';
import { Team } from './types/team';
import { FIVE_MINUTES_IN_MS } from '../../common/constants/cacheTimes';

export const useGetTeams = () => {
  return useQuery<Team[]>({
    queryKey: teamQueryKeys.list(),
    queryFn: async () => {
      const response = await getTeams();
      return response.data;
    },
    staleTime: FIVE_MINUTES_IN_MS,
  });
};

export const useGetTeamById = (id: string, enabled = true) => {
  return useQuery<Team>({
    queryKey: teamQueryKeys.detail(id),
    queryFn: async () => {
      const response = await getTeamById(id);
      return response.data;
    },
    enabled: enabled && !!id,
    staleTime: FIVE_MINUTES_IN_MS,
  });
};