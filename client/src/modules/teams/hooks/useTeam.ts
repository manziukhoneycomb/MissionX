import { useQuery } from '@tanstack/react-query';
import { getTeamById } from '../teamQueries';
import { TEAM_QUERY_KEYS } from '../teamQueryKeys';
import { CACHE_TIMES } from '../../../common/constants/cacheTimes';

export const useTeam = (id: string) => {
  return useQuery({
    queryKey: [TEAM_QUERY_KEYS.GET_TEAM, id],
    queryFn: () => getTeamById(id),
    staleTime: CACHE_TIMES.DEFAULT,
    enabled: !!id,
  });
};