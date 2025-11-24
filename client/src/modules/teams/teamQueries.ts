import { useQuery } from '@tanstack/react-query';
import * as teamService from './services/teamService';
import { teamKeys } from './teamQueryKeys';

export const useTeams = () => {
  return useQuery({
    queryKey: teamKeys.lists(),
    queryFn: teamService.getTeams,
  });
};

export const useTeam = (id: string) => {
  return useQuery({
    queryKey: teamKeys.detail(id),
    queryFn: () => teamService.getTeam(id),
    enabled: !!id,
  });
};
