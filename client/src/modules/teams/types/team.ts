export type TeamMember = {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  isActive: boolean;
};

export type Team = {
  id: string;
  name: string;
  description?: string;
  tenantId: string;
  userCount: number;
  createdAt: string;
  updatedAt: string;
};

export type CreateTeamInput = {
  name: string;
  description?: string;
  userIds?: string[];
};

export type CreateTeamSuperAdminInput = CreateTeamInput & {
  tenantId: string;
};

export type UpdateTeamInput = {
  name?: string;
  description?: string;
};

export type ManageTeamUsersInput = {
  userIds: string[];
};