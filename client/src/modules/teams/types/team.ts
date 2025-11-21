export interface Team {
  id: string;
  name: string;
  description?: string;
  tenantId: string;
  createdAt: string;
  updatedAt: string;
  members?: TeamMember[];
  memberCount?: number;
}

export interface TeamMember {
  id: string;
  userId: string;
  teamId: string;
  role: TeamRole;
  joinedAt: string;
  user: {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
  };
}

export interface TeamRole {
  id: string;
  name: string;
  permissions: string[];
  isTeamRole: boolean;
}

export interface CreateTeamInput {
  name: string;
  description?: string;
}

export interface UpdateTeamInput {
  name?: string;
  description?: string;
}

export interface AddTeamMemberInput {
  userId: string;
  roleId: string;
}

export interface UpdateTeamMemberInput {
  roleId: string;
}