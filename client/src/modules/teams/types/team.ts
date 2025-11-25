export type Team = {
  id: string;
  name: string;
  description?: string;
  tenant: {
    id: string;
    name: string;
  };
  members: {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
  }[];
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

export type AddTeamMemberInput = {
  userId: string;
};
