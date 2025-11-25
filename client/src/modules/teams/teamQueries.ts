import { useQuery } from '@tanstack/react-query';
import { getTeams } from './services/teamService';
import { teamQueryKeys } from './teamQueryKeys';

export const useTeams = () => {
  return useQuery({
    queryKey: teamQueryKeys.all,
    queryFn: getTeams,
  });
};
