import { useMutation, useQueryClient } from '@tanstack/react-query';

import { deleteAccount } from '@/auth/api/authApi';
import { clearAuthToken } from '@/auth/auth-token';
import { clearTempIds } from '@/lib/offline/temp-ids';
import { queryPersister } from '@/lib/query-client';
import { useAppStore } from '@/store/use-app-store';

export function useSignOut() {
  const queryClient = useQueryClient();
  const signOut = useAppStore((state) => state.signOut);

  return async () => {
    await clearAuthToken();
    signOut();
    queryClient.clear();
    clearTempIds();
    await queryPersister.removeClient();
  };
}

/** Signs out and forgets everything stored on this device. */
export function useResetDevice() {
  const queryClient = useQueryClient();
  const resetApp = useAppStore((state) => state.reset);

  return async () => {
    await clearAuthToken();
    resetApp();
    queryClient.clear();
    clearTempIds();
    await queryPersister.removeClient();
  };
}

/** Permanently deletes the account on the server, then clears this device. */
export function useDeleteAccount() {
  const resetDevice = useResetDevice();

  return useMutation({
    mutationFn: deleteAccount,
    onSuccess: resetDevice,
  });
}
