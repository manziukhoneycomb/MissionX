export type TeamMember = {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  roles: {
    id: string;
    name: string;
  }[];
};

export type Team = {
  id: string;
  name: string;
  description?: string;
  tenant: {
    id: string;
    name: string;
  };
  users: TeamMember[];
  createdAt: string;
  updatedAt: string;
};

export type CreateTeamRequest = {
  name: string;
  description?: string;
};

export type UpdateTeamRequest = Partial<CreateTeamRequest>;

export type ManageTeamUsersRequest = {
  userIds: string[];
};