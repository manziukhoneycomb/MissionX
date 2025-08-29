import { create } from 'zustand';
import { Tenant } from '../types/tenant';

interface TenantManagementState {
  isFormOpen: boolean;
  selectedTenant: Tenant | null;
  isConfirmDeleteDialogOpen: boolean;
  tenantToDeleteId: string | null;
  openCreateForm: () => void;
  openEditForm: (tenant: Tenant) => void;
  closeForm: () => void;
  openConfirmDeleteDialog: (id: string) => void;
  closeConfirmDeleteDialog: () => void;
  setTenantToDeleteId: (id: string | null) => void;
  resetDeleteState: () => void;
}

export const useTenantManagementStore = create<TenantManagementState>((set) => ({
  isFormOpen: false,
  selectedTenant: null,
  isConfirmDeleteDialogOpen: false,
  tenantToDeleteId: null,

  openCreateForm: (): void => set({ isFormOpen: true, selectedTenant: null }),
  openEditForm: (tenant: Tenant): void => set({ isFormOpen: true, selectedTenant: tenant }),
  closeForm: (): void => set({ isFormOpen: false, selectedTenant: null }),

  openConfirmDeleteDialog: (id: string): void =>
    set({ isConfirmDeleteDialogOpen: true, tenantToDeleteId: id }),
  closeConfirmDeleteDialog: (): void =>
    set({ isConfirmDeleteDialogOpen: false, tenantToDeleteId: null }),
  setTenantToDeleteId: (id: string | null): void => set({ tenantToDeleteId: id }),
  resetDeleteState: (): void => set({ isConfirmDeleteDialogOpen: false, tenantToDeleteId: null }),
}));
