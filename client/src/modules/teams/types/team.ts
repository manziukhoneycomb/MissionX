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
  tenant: {
    id: string;
    name: string;
  };
  members: TeamMember[];
  createdAt: string;
  updatedAt: string;
};

export type CreateTeamRequest = {
  name: string;
  description?: string;
};

export type UpdateTeamRequest = {
  name?: string;
  description?: string;
};

export type AddMemberRequest = {
  userId: string;
};
