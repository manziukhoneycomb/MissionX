export const CACHE_TIMES = {
  DEFAULT: 5 * 60 * 1000, // 5 minutes
  ANALYTICS: 10 * 60 * 1000, // 10 minutes (analytics data changes less frequently)
} as const;
