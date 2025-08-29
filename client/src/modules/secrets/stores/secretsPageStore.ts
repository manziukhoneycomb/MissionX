import { create } from 'zustand';

type SecretVisibilityState = {
  [key: string]: boolean;
};

interface SecretsPageState {
  visibility: SecretVisibilityState;
  setVisibility: (key: string, isVisible: boolean) => void;
  toggleVisibility: (key: string) => void;
  initializeVisibility: (keys: string[]) => void;
}

export const useSecretsPageStore = create<SecretsPageState>((set) => ({
  visibility: {},
  setVisibility: (key: string, isVisible: boolean): void =>
    set((state) => ({ visibility: { ...state.visibility, [key]: isVisible } })),
  toggleVisibility: (key: string): void =>
    set((state) => ({ visibility: { ...state.visibility, [key]: !state.visibility[key] } })),
  initializeVisibility: (keys: string[]): void =>
    set((state) => {
      const newVisibility: SecretVisibilityState = {};

      keys.forEach((key) => {
        newVisibility[key] = state.visibility[key] ?? false;
      });

      return { visibility: newVisibility };
    }),
}));
