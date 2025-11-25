import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Team, TeamMember } from './types/team';
import { teamQueryKeys } from './teamQueryKeys';
import { CACHE_TIMES } from '../../common/constants/cacheTimes';

export const getTeams = () => axios.get<Team[]>('/teams');

export const getTeamById = (id: string) => axios.get<Team>(`/teams/${id}`);

export const getTeamMembers = (teamId: string) => axios.get<TeamMember[]>(`/teams/${teamId}/members`);

export const useTeams = () => {
  return useQuery({
    queryKey: teamQueryKeys.lists(),
    queryFn: async () => {
      const response = await getTeams();
      return response.data;
    },
    staleTime: CACHE_TIMES.DEFAULT,
  });
};

export const useTeam = (id: string) => {
  return useQuery({
    queryKey: teamQueryKeys.detail(id),
    queryFn: async () => {
      const response = await getTeamById(id);
      return response.data;
    },
    enabled: !!id,
    staleTime: CACHE_TIMES.DEFAULT,
  });
};

export const useTeamMembers = (teamId: string) => {
  return useQuery({
    queryKey: teamQueryKeys.members(teamId),
    queryFn: async () => {
      const response = await getTeamMembers(teamId);
      return response.data;
    },
    enabled: !!teamId,
    staleTime: CACHE_TIMES.DEFAULT,
  });
};
