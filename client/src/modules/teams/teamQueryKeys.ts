export const teamQueryKeys = {
  all: ['teams'] as const,
  lists: () => [...teamQueryKeys.all, 'list'] as const,
  list: (filters?: Record<string, unknown>) => [...teamQueryKeys.lists(), filters] as const,
  details: () => [...teamQueryKeys.all, 'detail'] as const,
  detail: (id: string) => [...teamQueryKeys.details(), id] as const,
  members: (teamId: string) => [...teamQueryKeys.all, teamId, 'members'] as const,
};

export const TEAM_QUERY_KEYS = {
  GET_TEAMS: 'get-teams',
  GET_TEAM: 'get-team',
  GET_TEAM_MEMBERS: 'get-team-members',
} as const;
