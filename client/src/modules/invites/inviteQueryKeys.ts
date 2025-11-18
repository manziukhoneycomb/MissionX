export const inviteQueryKeys = {
  all: ['invites'] as const,
  tenantInvitations: (tenantId: string) => [...inviteQueryKeys.all, 'tenant', tenantId] as const,
} as const;