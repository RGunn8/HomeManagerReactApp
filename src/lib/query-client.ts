import { QueryClient, focusManager, onlineManager } from '@tanstack/react-query';
import { AppState, Platform } from 'react-native';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 1000 * 60,
      gcTime: 1000 * 60 * 30,
      refetchOnReconnect: true,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 0,
    },
  },
});

if (Platform.OS !== 'web') {
  AppState.addEventListener('change', (status) => {
    focusManager.setFocused(status === 'active');
  });
}

onlineManager.setEventListener((setOnline) => {
  setOnline(true);

  return () => {};
});
