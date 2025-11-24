import { useQuery } from '@tanstack/react-query';
import { teamService } from './services/teamService';
import { teamQueryKeys } from './teamQueryKeys';

export const useTeams = () => {
  return useQuery({
    queryKey: teamQueryKeys.all,
    queryFn: teamService.getTeams,
  });
};

export const useTeam = (id: string) => {
  return useQuery({
    queryKey: teamQueryKeys.detail(id),
    queryFn: () => teamService.getTeam(id),
    enabled: !!id,
  });
};
