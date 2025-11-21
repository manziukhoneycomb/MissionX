import { create } from 'zustand';
import { Team, TeamMember } from '../types/team';

interface TeamManagementState {
  isFormOpen: boolean;
  selectedTeam: Team | null;
  isConfirmDeleteDialogOpen: boolean;
  teamToDeleteId: string | null;
  isMembersDialogOpen: boolean;
  selectedTeamForMembers: Team | null;
  isAddMemberDialogOpen: boolean;
  memberToRemoveId: string | null;
  isConfirmRemoveMemberDialogOpen: boolean;
  searchQuery: string;
  selectedMembers: TeamMember[];

  openCreateForm: () => void;
  openEditForm: (team: Team) => void;
  closeForm: () => void;

  openConfirmDeleteDialog: (id: string) => void;
  closeConfirmDeleteDialog: () => void;
  setTeamToDeleteId: (id: string | null) => void;
  resetDeleteState: () => void;

  openMembersDialog: (team: Team) => void;
  closeMembersDialog: () => void;

  openAddMemberDialog: () => void;
  closeAddMemberDialog: () => void;

  openConfirmRemoveMemberDialog: (memberId: string) => void;
  closeConfirmRemoveMemberDialog: () => void;

  setSearchQuery: (query: string) => void;
  setSelectedMembers: (members: TeamMember[]) => void;
  resetMemberState: () => void;
}

export const useTeamManagementStore = create<TeamManagementState>((set) => ({
  isFormOpen: false,
  selectedTeam: null,
  isConfirmDeleteDialogOpen: false,
  teamToDeleteId: null,
  isMembersDialogOpen: false,
  selectedTeamForMembers: null,
  isAddMemberDialogOpen: false,
  memberToRemoveId: null,
  isConfirmRemoveMemberDialogOpen: false,
  searchQuery: '',
  selectedMembers: [],

  openCreateForm: (): void => set({ isFormOpen: true, selectedTeam: null }),
  openEditForm: (team: Team): void => set({ isFormOpen: true, selectedTeam: team }),
  closeForm: (): void => set({ isFormOpen: false, selectedTeam: null }),

  openConfirmDeleteDialog: (id: string): void =>
    set({ isConfirmDeleteDialogOpen: true, teamToDeleteId: id }),
  closeConfirmDeleteDialog: (): void =>
    set({ isConfirmDeleteDialogOpen: false, teamToDeleteId: null }),
  setTeamToDeleteId: (id: string | null): void => set({ teamToDeleteId: id }),
  resetDeleteState: (): void => set({ isConfirmDeleteDialogOpen: false, teamToDeleteId: null }),

  openMembersDialog: (team: Team): void =>
    set({ isMembersDialogOpen: true, selectedTeamForMembers: team }),
  closeMembersDialog: (): void =>
    set({ isMembersDialogOpen: false, selectedTeamForMembers: null, selectedMembers: [] }),

  openAddMemberDialog: (): void => set({ isAddMemberDialogOpen: true }),
  closeAddMemberDialog: (): void => set({ isAddMemberDialogOpen: false }),

  openConfirmRemoveMemberDialog: (memberId: string): void =>
    set({ isConfirmRemoveMemberDialogOpen: true, memberToRemoveId: memberId }),
  closeConfirmRemoveMemberDialog: (): void =>
    set({ isConfirmRemoveMemberDialogOpen: false, memberToRemoveId: null }),

  setSearchQuery: (query: string): void => set({ searchQuery: query }),
  setSelectedMembers: (members: TeamMember[]): void => set({ selectedMembers: members }),
  resetMemberState: (): void => set({
    isMembersDialogOpen: false,
    selectedTeamForMembers: null,
    isAddMemberDialogOpen: false,
    memberToRemoveId: null,
    isConfirmRemoveMemberDialogOpen: false,
    searchQuery: '',
    selectedMembers: [],
  }),
}));