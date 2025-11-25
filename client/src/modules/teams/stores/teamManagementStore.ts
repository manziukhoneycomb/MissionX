import { create } from 'zustand';
import { Team } from '../types/team';

interface TeamManagementState {
  selectedTeamId: string | null;
  isFormOpen: boolean;
  formMode: 'create' | 'edit';
  isMemberDialogOpen: boolean;
  isConfirmDeleteDialogOpen: boolean;
  teamToDeleteId: string | null;

  setSelectedTeam: (teamId: string | null) => void;
  openCreateForm: () => void;
  openEditForm: (team: Team) => void;
  closeForm: () => void;
  openMemberDialog: (teamId: string) => void;
  closeMemberDialog: () => void;
  openConfirmDeleteDialog: (teamId: string) => void;
  closeConfirmDeleteDialog: () => void;
  resetDeleteState: () => void;
}

export const useTeamManagementStore = create<TeamManagementState>((set) => ({
  selectedTeamId: null,
  isFormOpen: false,
  formMode: 'create',
  isMemberDialogOpen: false,
  isConfirmDeleteDialogOpen: false,
  teamToDeleteId: null,

  setSelectedTeam: (teamId: string | null): void => set({ selectedTeamId: teamId }),

  openCreateForm: (): void =>
    set({ isFormOpen: true, formMode: 'create', selectedTeamId: null }),

  openEditForm: (team: Team): void =>
    set({ isFormOpen: true, formMode: 'edit', selectedTeamId: team.id }),

  closeForm: (): void => set({ isFormOpen: false, selectedTeamId: null }),

  openMemberDialog: (teamId: string): void =>
    set({ isMemberDialogOpen: true, selectedTeamId: teamId }),

  closeMemberDialog: (): void => set({ isMemberDialogOpen: false, selectedTeamId: null }),

  openConfirmDeleteDialog: (teamId: string): void =>
    set({ isConfirmDeleteDialogOpen: true, teamToDeleteId: teamId }),

  closeConfirmDeleteDialog: (): void =>
    set({ isConfirmDeleteDialogOpen: false, teamToDeleteId: null }),

  resetDeleteState: (): void => set({ isConfirmDeleteDialogOpen: false, teamToDeleteId: null }),
}));
