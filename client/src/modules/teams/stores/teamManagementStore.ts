import { create } from 'zustand';
import { Team } from '../types/team';

interface TeamManagementState {
  isFormOpen: boolean;
  selectedTeam: Team | null;
  isConfirmDeleteDialogOpen: boolean;
  teamToDeleteId: string | null;
  isMembersDialogOpen: boolean;
  teamForMembersManagement: Team | null;

  openCreateForm: () => void;
  openEditForm: (team: Team) => void;
  closeForm: () => void;

  openConfirmDeleteDialog: (id: string) => void;
  closeConfirmDeleteDialog: () => void;
  resetDeleteState: () => void;

  openMembersDialog: (team: Team) => void;
  closeMembersDialog: () => void;
}

export const useTeamManagementStore = create<TeamManagementState>((set) => ({
  isFormOpen: false,
  selectedTeam: null,
  isConfirmDeleteDialogOpen: false,
  teamToDeleteId: null,
  isMembersDialogOpen: false,
  teamForMembersManagement: null,

  openCreateForm: () => set({ isFormOpen: true, selectedTeam: null }),
  openEditForm: (team: Team) => set({ isFormOpen: true, selectedTeam: team }),
  closeForm: () => set({ isFormOpen: false, selectedTeam: null }),

  openConfirmDeleteDialog: (id: string) =>
    set({ isConfirmDeleteDialogOpen: true, teamToDeleteId: id }),
  closeConfirmDeleteDialog: () =>
    set({ isConfirmDeleteDialogOpen: false, teamToDeleteId: null }),
  resetDeleteState: () => set({ isConfirmDeleteDialogOpen: false, teamToDeleteId: null }),

  openMembersDialog: (team: Team) =>
    set({ isMembersDialogOpen: true, teamForMembersManagement: team }),
  closeMembersDialog: () =>
    set({ isMembersDialogOpen: false, teamForMembersManagement: null }),
}));