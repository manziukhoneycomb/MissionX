import { RoleValue } from '../../../common/constants/roles';

export type Role = {
  id: string;
  name: RoleValue;
};

export type User = {
  id: string;
  email: string;
  subId?: string;
  firstName?: string;
  lastName?: string;
  tenant: {
    id: string;
    name: string;
  };
  roles: Role[];
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
};
