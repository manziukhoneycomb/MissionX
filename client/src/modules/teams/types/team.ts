import { User } from '../../users/types/user';

export type Team = {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  users?: User[];
};

export type CreateTeamInput = {
  name: string;
  description?: string;
};

export type UpdateTeamInput = Partial<CreateTeamInput>;
