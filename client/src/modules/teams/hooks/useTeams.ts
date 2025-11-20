import { useQuery } from '@tanstack/react-query';
import { getTeams } from '../teamQueries';
import { TEAM_QUERY_KEYS } from '../teamQueryKeys';
import { CACHE_TIMES } from '../../../common/constants/cacheTimes';

export const useTeams = () => {
  return useQuery({
    queryKey: [TEAM_QUERY_KEYS.GET_TEAMS],
    queryFn: getTeams,
    staleTime: CACHE_TIMES.DEFAULT,
  });
};