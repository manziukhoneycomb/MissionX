import { create } from 'zustand';
import { User } from '../types/user';

interface UserManagementState {
  isFormOpen: boolean;
  selectedUser: User | null;
  isConfirmDeleteDialogOpen: boolean;
  userToDeleteId: string | null;
  isConfirmToggleStatusDialogOpen: boolean;
  userToToggleStatus: User | null;

  openCreateForm: () => void;
  openEditForm: (user: User) => void;
  closeForm: () => void;

  openConfirmDeleteDialog: (id: string) => void;
  closeConfirmDeleteDialog: () => void;
  resetDeleteState: () => void;

  openConfirmToggleStatusDialog: (user: User) => void;
  closeConfirmToggleStatusDialog: () => void;
  resetToggleStatusState: () => void;
}

export const useUserManagementStore = create<UserManagementState>((set) => ({
  // Initial state
  isFormOpen: false,
  selectedUser: null,
  isConfirmDeleteDialogOpen: false,
  userToDeleteId: null,
  isConfirmToggleStatusDialogOpen: false,
  userToToggleStatus: null,

  openCreateForm: (): void => set({ isFormOpen: true, selectedUser: null }),
  openEditForm: (user: User): void => set({ isFormOpen: true, selectedUser: user }),
  closeForm: (): void => set({ isFormOpen: false, selectedUser: null }),

  openConfirmDeleteDialog: (id: string): void =>
    set({ isConfirmDeleteDialogOpen: true, userToDeleteId: id }),
  closeConfirmDeleteDialog: (): void =>
    set({ isConfirmDeleteDialogOpen: false, userToDeleteId: null }),
  resetDeleteState: (): void => set({ isConfirmDeleteDialogOpen: false, userToDeleteId: null }),

  openConfirmToggleStatusDialog: (user: User): void =>
    set({ isConfirmToggleStatusDialogOpen: true, userToToggleStatus: user }),
  closeConfirmToggleStatusDialog: (): void =>
    set({ isConfirmToggleStatusDialogOpen: false, userToToggleStatus: null }),
  resetToggleStatusState: (): void =>
    set({ isConfirmToggleStatusDialogOpen: false, userToToggleStatus: null }),
}));
