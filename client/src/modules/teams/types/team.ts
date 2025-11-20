
export type TeamRole = {
  id: string;
  name: string;
  description?: string;
};

export type TeamMember = {
  id: string;
  userId: string;
  userEmail: string;
  userFirstName?: string;
  userLastName?: string;
  teamRole: TeamRole;
  joinedAt: string;
};

export type Team = {
  id: string;
  name: string;
  description?: string;
  tenantId: string;
  tenantName: string;
  members: TeamMember[];
  permissions: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type CreateTeamInput = {
  name: string;
  description?: string;
  permissions?: string[];
};

export type UpdateTeamInput = {
  name?: string;
  description?: string;
  permissions?: string[];
  isActive?: boolean;
};

export type AddTeamMemberInput = {
  userId: string;
  teamRoleId: string;
};

export type UpdateTeamMemberInput = {
  teamRoleId: string;
};

export type TeamPermission = {
  id: string;
  name: string;
  description?: string;
};