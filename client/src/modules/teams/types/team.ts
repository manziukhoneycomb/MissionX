export interface User {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
    isActive: boolean;
    roles: Role[];
    createdAt: string;
    updatedAt: string;
}

export interface Role {
    id: string;
    name: string;
}

export interface Tenant {
    id: string;
    name: string;
}

export interface Team {
    id: string;
    name: string;
    description?: string;
    tenant: Pick<Tenant, 'id' | 'name'>;
    users: User[];
    createdAt: string;
    updatedAt: string;
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
}