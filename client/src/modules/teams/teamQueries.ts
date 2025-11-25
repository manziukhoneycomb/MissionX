import { useQuery } from '@tanstack/react-query';
import { teamService } from './services/teamService';
import { TEAM_QUERY_KEYS } from './teamQueryKeys';

export const useTeams = () => {
  return useQuery({
    queryKey: [TEAM_QUERY_KEYS.GET_TEAMS],
    queryFn: teamService.getTeams,
  });
};

export const useTeam = (id: string) => {
  return useQuery({
    queryKey: [TEAM_QUERY_KEYS.GET_TEAM, id],
    queryFn: () => teamService.getTeam(id),
    enabled: !!id,
  });
};
