import { useQuery } from '@tanstack/react-query';
import { InviteService } from './services/inviteService';
import { inviteQueryKeys } from './inviteQueryKeys';
import { InviteResponseDto } from './types/invite';

export const useTenantInvitations = (tenantId: string) => {
  return useQuery<InviteResponseDto[], Error>({
    queryKey: inviteQueryKeys.tenantInvitations(tenantId),
    queryFn: () => InviteService.getTenantInvitations(tenantId),
    enabled: !!tenantId,
  });
};