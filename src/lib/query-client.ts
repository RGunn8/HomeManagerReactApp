import '@/lib/offline/mutations';
import '@/lib/offline/network';

import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import { QueryClient, focusManager, type Mutation } from '@tanstack/react-query';
import type { PersistQueryClientOptions } from '@tanstack/react-query-persist-client';
import { AppState, Platform } from 'react-native';

import { registerOfflineMutations } from '@/lib/offline/offline-mutation';
import { offlineStorage } from '@/lib/offline/storage';

const ONE_WEEK = 1000 * 60 * 60 * 24 * 7;

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 1000 * 60,
      // Kept as long as the saved cache, so data is still there when the app opens offline.
      gcTime: ONE_WEEK,
      refetchOnReconnect: true,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 0,
    },
  },
});

registerOfflineMutations(queryClient);

export const queryPersister = createAsyncStoragePersister({
  storage: offlineStorage,
  key: 'home-manager-query-cache',
});

export const persistOptions: Omit<PersistQueryClientOptions, 'queryClient'> = {
  persister: queryPersister,
  maxAge: ONE_WEEK,
  dehydrateOptions: {
    // Save every change that hasn't finished, including one in flight when the app closes.
    shouldDehydrateMutation: (mutation: Mutation) => mutation.state.status === 'pending',
  },
};

if (Platform.OS !== 'web') {
  AppState.addEventListener('change', (status) => {
    focusManager.setFocused(status === 'active');
  });
}
