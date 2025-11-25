export type Team = {
  id: string;
  name: string;
  description: string;
  tenantId: string;
  members: TeamMember[];
  createdAt: string;
  updatedAt: string;
};

export type TeamMember = {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
};

export type CreateTeamInput = {
  name: string;
  description: string;
};

export type UpdateTeamInput = {
  name?: string;
  description?: string;
};

export type AddTeamMemberInput = {
  userId: string;
};
