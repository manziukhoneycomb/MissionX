export type InvitationRole = {
  id: string;
  name: string;
};

export type Invitation = {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  status: 'pending' | 'accepted' | 'expired';
  invitedBy: string;
  createdAt: string;
  expiresAt: string;
  tenant: {
    id: string;
    name: string;
  };
  roles: InvitationRole[];
};

export type InviteUserRequest = {
  email: string;
  firstName?: string;
  lastName?: string;
  roleIds: string[];
};