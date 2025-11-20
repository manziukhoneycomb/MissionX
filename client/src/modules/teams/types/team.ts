import { User } from '../../users/types/user';

export type TeamRole = 'OWNER' | 'ADMIN' | 'MEMBER';

export type TeamMember = {
  id: string;
  user: User;
  teamRole: TeamRole;
  joinedAt: string;
};

export type TeamPermission = {
  id: string;
  name: string;
  description: string;
};

export type Team = {
  id: string;
  name: string;
  description?: string;
  tenantId: string;
  members: TeamMember[];
  permissions: TeamPermission[];
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
};

export type CreateTeamInput = {
  name: string;
  description?: string;
  memberIds?: string[];
  permissionIds?: string[];
};

export type UpdateTeamInput = {
  name?: string;
  description?: string;
  permissionIds?: string[];
};

export type AddTeamMemberInput = {
  userId: string;
  teamRole: TeamRole;
};

export type UpdateTeamMemberInput = {
  teamRole: TeamRole;
};