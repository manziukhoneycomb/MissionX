export const teamQueryKeys = {
  all: ['teams'] as const,
  lists: () => [...teamQueryKeys.all, 'list'] as const,
  list: (filters: string) => [...teamQueryKeys.lists(), { filters }] as const,
  details: () => [...teamQueryKeys.all, 'detail'] as const,
  detail: (id: string) => [...teamQueryKeys.details(), id] as const,
  members: (id: string) => [...teamQueryKeys.detail(id), 'members'] as const,
};