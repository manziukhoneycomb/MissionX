export interface InviteUserDto {
  email: string;
  firstName?: string;
  lastName?: string;
  roleIds: string[];
  message?: string;
}

export interface InviteResponseDto {
  invitationId: string;
  email: string;
  status: 'pending' | 'accepted' | 'revoked';
  tenantId: string;
  roleIds: string[];
  createdAt: Date;
  expiresAt: Date;
}

export interface InvitationListResponse {
  invitations: InviteResponseDto[];
}