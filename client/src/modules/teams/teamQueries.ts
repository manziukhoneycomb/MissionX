import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { teamService, PaginatedResponseDto } from './services/teamService';
import { Team } from './types/team';
import { TEAM_QUERY_KEYS } from './teamQueryKeys';

export const useGetTeams = (
  page: number = 1,
  limit: number = 10,
  options?: UseQueryOptions<PaginatedResponseDto<Team>>
) => {
  return useQuery({
    queryKey: [TEAM_QUERY_KEYS.GET_TEAMS, page, limit],
    queryFn: () => teamService.getTeams(page, limit),
    ...options
  });
};

export const useGetTeamById = (
  id: string,
  options?: UseQueryOptions<Team>
) => {
  return useQuery({
    queryKey: [TEAM_QUERY_KEYS.GET_TEAM_BY_ID, id],
    queryFn: () => teamService.getTeamById(id),
    enabled: !!id,
    ...options
  });
};