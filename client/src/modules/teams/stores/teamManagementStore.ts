import { create } from 'zustand';
import { Team } from '../types/team';

interface TeamManagementState {
  isFormOpen: boolean;
  selectedTeam: Team | null;
  isConfirmDeleteDialogOpen: boolean;
  teamToDeleteId: string | null;
  isConfirmToggleStatusDialogOpen: boolean;
  teamToToggleStatus: Team | null;
  isMemberDialogOpen: boolean;
  selectedTeamForMembers: Team | null;
  isAddMemberDialogOpen: boolean;

  openCreateForm: () => void;
  openEditForm: (team: Team) => void;
  closeForm: () => void;

  openConfirmDeleteDialog: (id: string) => void;
  closeConfirmDeleteDialog: () => void;
  resetDeleteState: () => void;

  openConfirmToggleStatusDialog: (team: Team) => void;
  closeConfirmToggleStatusDialog: () => void;
  resetToggleStatusState: () => void;

  openMemberDialog: (team: Team) => void;
  closeMemberDialog: () => void;

  openAddMemberDialog: () => void;
  closeAddMemberDialog: () => void;
}

export const useTeamManagementStore = create<TeamManagementState>((set) => ({
  isFormOpen: false,
  selectedTeam: null,
  isConfirmDeleteDialogOpen: false,
  teamToDeleteId: null,
  isConfirmToggleStatusDialogOpen: false,
  teamToToggleStatus: null,
  isMemberDialogOpen: false,
  selectedTeamForMembers: null,
  isAddMemberDialogOpen: false,

  openCreateForm: (): void => set({ isFormOpen: true, selectedTeam: null }),
  openEditForm: (team: Team): void => set({ isFormOpen: true, selectedTeam: team }),
  closeForm: (): void => set({ isFormOpen: false, selectedTeam: null }),

  openConfirmDeleteDialog: (id: string): void =>
    set({ isConfirmDeleteDialogOpen: true, teamToDeleteId: id }),
  closeConfirmDeleteDialog: (): void =>
    set({ isConfirmDeleteDialogOpen: false, teamToDeleteId: null }),
  resetDeleteState: (): void => set({ isConfirmDeleteDialogOpen: false, teamToDeleteId: null }),

  openConfirmToggleStatusDialog: (team: Team): void =>
    set({ isConfirmToggleStatusDialogOpen: true, teamToToggleStatus: team }),
  closeConfirmToggleStatusDialog: (): void =>
    set({ isConfirmToggleStatusDialogOpen: false, teamToToggleStatus: null }),
  resetToggleStatusState: (): void =>
    set({ isConfirmToggleStatusDialogOpen: false, teamToToggleStatus: null }),

  openMemberDialog: (team: Team): void =>
    set({ isMemberDialogOpen: true, selectedTeamForMembers: team }),
  closeMemberDialog: (): void =>
    set({ isMemberDialogOpen: false, selectedTeamForMembers: null }),

  openAddMemberDialog: (): void => set({ isAddMemberDialogOpen: true }),
  closeAddMemberDialog: (): void => set({ isAddMemberDialogOpen: false }),
}));