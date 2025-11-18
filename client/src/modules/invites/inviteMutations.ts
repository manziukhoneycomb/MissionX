import { useMutation, useQueryClient } from '@tanstack/react-query';
import { InviteService } from './services/inviteService';
import { inviteQueryKeys } from './inviteQueryKeys';
import { InviteUserDto, InviteResponseDto } from './types/invite';

export const useInviteUserToTenant = () => {
  const queryClient = useQueryClient();

  return useMutation<InviteResponseDto, Error, { tenantId: string; inviteData: InviteUserDto }>({
    mutationFn: ({ tenantId, inviteData }) => InviteService.inviteUserToTenant(tenantId, inviteData),
    onSuccess: (_, { tenantId }) => {
      // Invalidate and refetch tenant invitations
      queryClient.invalidateQueries({
        queryKey: inviteQueryKeys.tenantInvitations(tenantId)
      });
    },
  });
};

export const useRevokeInvitation = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, { tenantId: string; invitationId: string }>({
    mutationFn: ({ tenantId, invitationId }) => InviteService.revokeInvitation(tenantId, invitationId),
    onSuccess: (_, { tenantId }) => {
      // Invalidate and refetch tenant invitations
      queryClient.invalidateQueries({
        queryKey: inviteQueryKeys.tenantInvitations(tenantId)
      });
    },
  });
};