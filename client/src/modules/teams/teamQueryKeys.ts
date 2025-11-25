export const teamQueryKeys = {
  all: ['teams'] as const,
  lists: () => [...teamQueryKeys.all, 'list'] as const,
  list: (filters?: Record<string, unknown>) => [...teamQueryKeys.lists(), filters] as const,
  details: () => [...teamQueryKeys.all, 'detail'] as const,
  detail: (id: string) => [...teamQueryKeys.details(), id] as const,
  members: (teamId: string) => [...teamQueryKeys.all, teamId, 'members'] as const,
};
