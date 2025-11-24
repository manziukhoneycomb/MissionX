import { useQuery } from '@tanstack/react-query';
import { teamKeys } from './teamQueryKeys';
import { getTeams, getTeamById, getTeamUsers } from './services/teamService';
import { CACHE_TIMES } from '../../common/constants/cacheTimes';

export const useGetTeams = () => {
  return useQuery({
    queryKey: teamKeys.lists(),
    queryFn: async () => {
      const { data } = await getTeams();
      return data;
    },
    staleTime: CACHE_TIMES.DEFAULT,
  });
};

export const useGetTeamById = (id: string) => {
  return useQuery({
    queryKey: teamKeys.detail(id),
    queryFn: async () => {
      const { data } = await getTeamById(id);
      return data;
    },
    enabled: !!id,
    staleTime: CACHE_TIMES.DEFAULT,
  });
};

export const useGetTeamUsers = (teamId: string) => {
  return useQuery({
    queryKey: teamKeys.users(teamId),
    queryFn: async () => {
      const { data } = await getTeamUsers(teamId);
      return data;
    },
    enabled: !!teamId,
    staleTime: CACHE_TIMES.DEFAULT,
  });
};