export const teamQueryKeys = {
  all: ['teams'] as const,
  list: () => [...teamQueryKeys.all, 'list'] as const,
  detail: (id: string) => [...teamQueryKeys.all, 'detail', id] as const,
};