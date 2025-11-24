export const teamQueryKeys = {
  all: ['teams'] as const,
  details: () => [...teamQueryKeys.all, 'detail'] as const,
  detail: (id: string) => [...teamQueryKeys.details(), id] as const,
};
