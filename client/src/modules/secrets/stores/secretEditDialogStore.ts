import { create } from 'zustand';

interface SecretEditDialogState {
  isOpen: boolean;
  secretKey: string | null;
  currentValue: string | null;
  newValue: string;
  openDialog: (key: string, value: string) => void;
  closeDialog: () => void;
  setNewValue: (value: string) => void;
}

export const useSecretEditDialogStore = create<SecretEditDialogState>((set) => ({
  isOpen: false,
  secretKey: null,
  currentValue: null,
  newValue: '',
  openDialog: (key: string, value: string): void =>
    set({
      isOpen: true,
      secretKey: key,
      currentValue: value,
      newValue: value,
    }),
  closeDialog: (): void =>
    set({
      isOpen: false,
      secretKey: null,
      currentValue: null,
      newValue: '',
    }),
  setNewValue: (value: string): void => set({ newValue: value }),
}));
