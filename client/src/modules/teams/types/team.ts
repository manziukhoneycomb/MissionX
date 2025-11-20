import { RoleValue } from '../../../common/constants/roles';

export type TeamRole = {
  id: string;
  name: RoleValue;
};

export type TeamMember = {
  id: string;
  teamId: string;
  userId: string;
  role: RoleValue;
  joinedAt: string;
  user: {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
  };
};

export type Team = {
  id: string;
  name: string;
  description?: string;
  tenantId: string;
  tenant: {
    id: string;
    name: string;
  };
  teamMembers?: TeamMember[];
  createdAt: string;
  updatedAt: string;
};