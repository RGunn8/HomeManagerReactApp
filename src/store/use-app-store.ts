import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

type ColorSchemePreference = 'system' | 'light' | 'dark';

type AppState = {
  isLoggedIn: boolean;
  colorSchemePreference: ColorSchemePreference;
  signIn: () => void;
  signOut: () => void;
  setColorSchemePreference: (colorSchemePreference: ColorSchemePreference) => void;
  reset: () => void;
};

const initialState: Pick<AppState, 'isLoggedIn' | 'colorSchemePreference'> = {
  isLoggedIn: false,
  colorSchemePreference: 'system',
};

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      ...initialState,
      signIn: () => set({ isLoggedIn: true }),
      signOut: () => set({ isLoggedIn: false }),
      setColorSchemePreference: (colorSchemePreference) => set({ colorSchemePreference }),
      reset: () => set(initialState),
    }),
    {
      name: 'home-manager-app-store',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
