import { User } from '../../users/types/user';

export interface Team {
  id: string;
  name: string;
  description?: string;
  users?: User[];
  tenantId?: string;
}

export interface CreateTeamInput {
  name: string;
  description?: string;
}

export interface UpdateTeamInput {
  name?: string;
  description?: string;
}
