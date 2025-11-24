import { useQuery } from '@tanstack/react-query';
import { teamService } from './services/teamService';
import { TEAM_QUERY_KEYS } from './teamQueryKeys';
import { CACHE_TIMES } from '../../common/constants/cacheTimes';

export const useTeams = () => {
  return useQuery({
    queryKey: [TEAM_QUERY_KEYS.GET_TEAMS],
    queryFn: teamService.getTeams,
    staleTime: CACHE_TIMES.FIVE_MINUTES,
  });
};

export const useTeam = (id: string, enabled = true) => {
  return useQuery({
    queryKey: [TEAM_QUERY_KEYS.GET_TEAM, id],
    queryFn: () => teamService.getTeam(id),
    staleTime: CACHE_TIMES.FIVE_MINUTES,
    enabled,
  });
};