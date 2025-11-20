import { create } from 'zustand';
import { Team, TeamMember } from '../types/team';

interface TeamManagementState {
  isFormOpen: boolean;
  selectedTeam: Team | null;
  isConfirmDeleteDialogOpen: boolean;
  teamToDeleteId: string | null;
  isMemberFormOpen: boolean;
  selectedMember: TeamMember | null;
  isConfirmRemoveMemberDialogOpen: boolean;
  memberToRemoveId: string | null;
  currentTeamId: string | null;

  openCreateForm: () => void;
  openEditForm: (team: Team) => void;
  closeForm: () => void;
  openConfirmDeleteDialog: (id: string) => void;
  closeConfirmDeleteDialog: () => void;
  setTeamToDeleteId: (id: string | null) => void;
  resetDeleteState: () => void;

  openMemberForm: (teamId: string, member?: TeamMember) => void;
  closeMemberForm: () => void;
  openConfirmRemoveMemberDialog: (memberId: string) => void;
  closeConfirmRemoveMemberDialog: () => void;
  setMemberToRemoveId: (id: string | null) => void;
  resetMemberState: () => void;

  setCurrentTeamId: (id: string | null) => void;
}

export const useTeamManagementStore = create<TeamManagementState>((set) => ({
  isFormOpen: false,
  selectedTeam: null,
  isConfirmDeleteDialogOpen: false,
  teamToDeleteId: null,
  isMemberFormOpen: false,
  selectedMember: null,
  isConfirmRemoveMemberDialogOpen: false,
  memberToRemoveId: null,
  currentTeamId: null,

  openCreateForm: (): void => set({ isFormOpen: true, selectedTeam: null }),
  openEditForm: (team: Team): void => set({ isFormOpen: true, selectedTeam: team }),
  closeForm: (): void => set({ isFormOpen: false, selectedTeam: null }),

  openConfirmDeleteDialog: (id: string): void =>
    set({ isConfirmDeleteDialogOpen: true, teamToDeleteId: id }),
  closeConfirmDeleteDialog: (): void =>
    set({ isConfirmDeleteDialogOpen: false, teamToDeleteId: null }),
  setTeamToDeleteId: (id: string | null): void => set({ teamToDeleteId: id }),
  resetDeleteState: (): void => set({ isConfirmDeleteDialogOpen: false, teamToDeleteId: null }),

  openMemberForm: (teamId: string, member?: TeamMember): void =>
    set({ isMemberFormOpen: true, selectedMember: member || null, currentTeamId: teamId }),
  closeMemberForm: (): void =>
    set({ isMemberFormOpen: false, selectedMember: null }),
  openConfirmRemoveMemberDialog: (memberId: string): void =>
    set({ isConfirmRemoveMemberDialogOpen: true, memberToRemoveId: memberId }),
  closeConfirmRemoveMemberDialog: (): void =>
    set({ isConfirmRemoveMemberDialogOpen: false, memberToRemoveId: null }),
  setMemberToRemoveId: (id: string | null): void => set({ memberToRemoveId: id }),
  resetMemberState: (): void =>
    set({
      isConfirmRemoveMemberDialogOpen: false,
      memberToRemoveId: null,
      isMemberFormOpen: false,
      selectedMember: null,
    }),

  setCurrentTeamId: (id: string | null): void => set({ currentTeamId: id }),
}));