export type TeamMember = {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
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
  members: TeamMember[];
  createdAt: string;
  updatedAt: string;
};

export type CreateTeamInput = {
  name: string;
  description?: string;
};

export type UpdateTeamInput = {
  name?: string;
  description?: string;
};

export type AddTeamMembersInput = {
  userIds: string[];
};

export type RemoveTeamMembersInput = {
  userIds: string[];
};