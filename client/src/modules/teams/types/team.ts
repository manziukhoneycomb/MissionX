import { User } from '../../users/types/user';

export type Team = {
  id: string;
  name: string;
  description?: string;
  tenantId: string;
  users: User[];
  createdAt: string;
  updatedAt: string;
};

export type CreateTeamInput = {
  name: string;
  description?: string;
};

export type UpdateTeamInput = {
  name: string;
  description?: string;
};

export type AddTeamMemberInput = {
  userId: string;
};