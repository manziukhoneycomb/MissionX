import { create } from 'zustand';
import { Team } from '../types/team';

interface TeamManagementState {
  isFormOpen: boolean;
  selectedTeam: Team | null;
  isConfirmDeleteDialogOpen: boolean;
  teamToDeleteId: string | null;
  isMemberManagementOpen: boolean;
  teamForMemberManagement: Team | null;

  openCreateForm: () => void;
  openEditForm: (team: Team) => void;
  closeForm: () => void;

  openConfirmDeleteDialog: (id: string) => void;
  closeConfirmDeleteDialog: () => void;
  resetDeleteState: () => void;

  openMemberManagement: (team: Team) => void;
  closeMemberManagement: () => void;
}

export const useTeamManagementStore = create<TeamManagementState>((set) => ({
  isFormOpen: false,
  selectedTeam: null,
  isConfirmDeleteDialogOpen: false,
  teamToDeleteId: null,
  isMemberManagementOpen: false,
  teamForMemberManagement: null,

  openCreateForm: (): void => set({ isFormOpen: true, selectedTeam: null }),
  openEditForm: (team: Team): void => set({ isFormOpen: true, selectedTeam: team }),
  closeForm: (): void => set({ isFormOpen: false, selectedTeam: null }),

  openConfirmDeleteDialog: (id: string): void =>
    set({ isConfirmDeleteDialogOpen: true, teamToDeleteId: id }),
  closeConfirmDeleteDialog: (): void =>
    set({ isConfirmDeleteDialogOpen: false, teamToDeleteId: null }),
  resetDeleteState: (): void => set({ isConfirmDeleteDialogOpen: false, teamToDeleteId: null }),

  openMemberManagement: (team: Team): void =>
    set({ isMemberManagementOpen: true, teamForMemberManagement: team }),
  closeMemberManagement: (): void =>
    set({ isMemberManagementOpen: false, teamForMemberManagement: null }),
}));
