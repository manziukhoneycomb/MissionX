import { create } from 'zustand';
import { Team, TeamMember } from '../types/team';

interface TeamManagementState {
  isFormOpen: boolean;
  selectedTeam: Team | null;
  isConfirmDeleteDialogOpen: boolean;
  teamToDeleteId: string | null;
  isAddMemberDialogOpen: boolean;
  selectedTeamForMember: Team | null;
  isConfirmRemoveMemberDialogOpen: boolean;
  memberToRemove: TeamMember | null;

  openCreateForm: () => void;
  openEditForm: (team: Team) => void;
  closeForm: () => void;

  openConfirmDeleteDialog: (id: string) => void;
  closeConfirmDeleteDialog: () => void;
  resetDeleteState: () => void;

  openAddMemberDialog: (team: Team) => void;
  closeAddMemberDialog: () => void;

  openConfirmRemoveMemberDialog: (member: TeamMember) => void;
  closeConfirmRemoveMemberDialog: () => void;
  resetRemoveMemberState: () => void;
}

export const useTeamManagementStore = create<TeamManagementState>((set) => ({
  isFormOpen: false,
  selectedTeam: null,
  isConfirmDeleteDialogOpen: false,
  teamToDeleteId: null,
  isAddMemberDialogOpen: false,
  selectedTeamForMember: null,
  isConfirmRemoveMemberDialogOpen: false,
  memberToRemove: null,

  openCreateForm: (): void => set({ isFormOpen: true, selectedTeam: null }),
  openEditForm: (team: Team): void => set({ isFormOpen: true, selectedTeam: team }),
  closeForm: (): void => set({ isFormOpen: false, selectedTeam: null }),

  openConfirmDeleteDialog: (id: string): void =>
    set({ isConfirmDeleteDialogOpen: true, teamToDeleteId: id }),
  closeConfirmDeleteDialog: (): void =>
    set({ isConfirmDeleteDialogOpen: false, teamToDeleteId: null }),
  resetDeleteState: (): void => set({ isConfirmDeleteDialogOpen: false, teamToDeleteId: null }),

  openAddMemberDialog: (team: Team): void =>
    set({ isAddMemberDialogOpen: true, selectedTeamForMember: team }),
  closeAddMemberDialog: (): void =>
    set({ isAddMemberDialogOpen: false, selectedTeamForMember: null }),

  openConfirmRemoveMemberDialog: (member: TeamMember): void =>
    set({ isConfirmRemoveMemberDialogOpen: true, memberToRemove: member }),
  closeConfirmRemoveMemberDialog: (): void =>
    set({ isConfirmRemoveMemberDialogOpen: false, memberToRemove: null }),
  resetRemoveMemberState: (): void =>
    set({ isConfirmRemoveMemberDialogOpen: false, memberToRemove: null }),
}));