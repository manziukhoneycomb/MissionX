import { useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  createTeam, 
  updateTeam, 
  deleteTeam, 
  addTeamMember, 
  removeTeamMember 
} from './services/teamService';
import { teamQueryKeys } from './teamQueryKeys';
import { CreateTeamInput, UpdateTeamInput, AddTeamMemberInput } from './types/team';

export const useCreateTeam = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (teamData: CreateTeamInput) => createTeam(teamData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: teamQueryKeys.lists() });
    },
  });
};

export const useUpdateTeam = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTeamInput }) => 
      updateTeam(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: teamQueryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: teamQueryKeys.detail(id) });
    },
  });
};

export const useDeleteTeam = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteTeam(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: teamQueryKeys.lists() });
    },
  });
};

export const useAddTeamMember = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ teamId, memberData }: { teamId: string; memberData: AddTeamMemberInput }) => 
      addTeamMember(teamId, memberData),
    onSuccess: (_, { teamId }) => {
      queryClient.invalidateQueries({ queryKey: teamQueryKeys.detail(teamId) });
      queryClient.invalidateQueries({ queryKey: teamQueryKeys.members(teamId) });
      queryClient.invalidateQueries({ queryKey: teamQueryKeys.lists() });
    },
  });
};

export const useRemoveTeamMember = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ teamId, userId }: { teamId: string; userId: string }) => 
      removeTeamMember(teamId, userId),
    onSuccess: (_, { teamId }) => {
      queryClient.invalidateQueries({ queryKey: teamQueryKeys.detail(teamId) });
      queryClient.invalidateQueries({ queryKey: teamQueryKeys.members(teamId) });
      queryClient.invalidateQueries({ queryKey: teamQueryKeys.lists() });
    },
  });
};