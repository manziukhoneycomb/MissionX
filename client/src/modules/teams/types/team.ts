import { User } from '../../users/types/user';

export interface Team {
  id: string;
  name: string;
  description: string;
  tenant: {
    id: string;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
  users: TeamMember[];
}

export interface TeamMember {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
}